import { expect, it } from "vite-plus/test";
import { WebSocketServer } from "ws";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

it("starts the packaged plugin and handles SDK 3 settings and inspector requests", async () => {
  const bundle = resolve("plugin/com.dim.streamdeck.sdPlugin");
  const temp = await mkdtemp(`${tmpdir()}/dim-runtime-`);
  const server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
  await once(server, "listening");
  await cp(`${bundle}/imgs`, `${temp}/imgs`, { recursive: true });
  await cp(`${bundle}/bin`, `${temp}/bin`, { recursive: true });
  await cp(`${bundle}/canvaskit.wasm`, `${temp}/canvaskit.wasm`);
  await cp(`${bundle}/fallbacks`, `${temp}/fallbacks`, { recursive: true });
  await cp(`${bundle}/manifest.json`, `${temp}/manifest.json`);
  const manifest = JSON.parse(await readFile(`${bundle}/manifest.json`, "utf8"));
  const info = {
    application: { version: "7.6.0", platform: "mac", language: "en", font: "Arial" },
    plugin: { uuid: manifest.UUID, version: manifest.Version },
    devices: [{ id: "deck", name: "Test", type: 0, size: { columns: 5, rows: 3 } }],
  };
  const connection = once(server, "connection");
  const child = spawn(
    process.execPath,
    [
      "--import",
      resolve("plugin/tests/runtime-preload.mjs"),
      `${temp}/bin/plugin.js`,
      "-port",
      String((server.address() as { port: number }).port),
      "-pluginUUID",
      manifest.UUID,
      "-registerEvent",
      "registerPlugin",
      "-info",
      JSON.stringify(info),
    ],
    { cwd: temp, stdio: ["ignore", "pipe", "pipe"] },
  );
  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk));
  child.stderr.on("data", (chunk) => (output += chunk));
  try {
    const [socket] = await Promise.race([
      connection,
      delay(5000, undefined, { ref: false }).then(() => {
        throw new Error(`Plugin did not connect: ${output.slice(-2000)}`);
      }),
      once(child, "exit").then(([code]) => {
        throw new Error(`Plugin exited before registration: ${code}`);
      }),
    ]);
    const messages: Record<string, any>[] = [];
    socket.on("message", (raw: Buffer) => {
      const message = JSON.parse(raw.toString());
      messages.push(message);
      if (message.event === "getGlobalSettings") {
        socket.send(
          JSON.stringify({
            event: "didReceiveGlobalSettings",
            id: message.id,
            payload: { settings: { setupDate: "2026-01-01" } },
          }),
        );
      }
    });
    await expect.poll(() => messages.some((m) => m.event === "registerPlugin")).toBe(true);
    const event = {
      action: "com.dim.streamdeck.loadout",
      context: "key",
      device: "deck",
      payload: {
        controller: "Keypad",
        settings: {},
        coordinates: { row: 0, column: 0 },
        isInMultiAction: false,
      },
    };
    socket.send(JSON.stringify({ ...event, event: "willAppear" }));
    socket.send(JSON.stringify({ ...event, event: "propertyInspectorDidAppear" }));
    socket.send(
      JSON.stringify({
        ...event,
        event: "didReceiveSettings",
        payload: {
          ...event.payload,
          settings: { label: "Example", loadout: "loadout", character: "character" },
        },
      }),
    );
    await expect
      .poll(() =>
        messages.some((m) => m.event === "setTitle" && m.payload.title.includes("Exampl")),
      )
      .toBe(true);
    socket.send(
      JSON.stringify({
        ...event,
        event: "sendToPlugin",
        payload: { id: "request", path: "checkpoints-activities" },
      }),
    );
    await expect
      .poll(
        () =>
          messages.find((m) => m.event === "sendToPropertyInspector" && m.payload.id === "request")
            ?.payload,
      )
      .toEqual({ id: "request", status: 200, body: [] });
    expect(child.exitCode).toBeNull();
  } catch (error) {
    for (const file of await readdir(`${temp}/logs`).catch(() => [])) {
      console.error((await readFile(`${temp}/logs/${file}`, "utf8")).slice(-3000));
    }
    throw error;
  } finally {
    if (child.exitCode === null) {
      child.kill();
      await once(child, "exit");
    }
    for (const socket of server.clients) socket.terminate();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(temp, { recursive: true, force: true });
  }
}, 15000);
