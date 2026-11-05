import { expect, it } from "vite-plus/test";
import { WebSocket, WebSocketServer } from "ws";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

it.each([
  { stalled: false, protectedManifest: false },
  { stalled: true, protectedManifest: true },
])(
  "starts the packaged plugin with stalled checkpoints=$stalled and protected manifest=$protectedManifest",
  async ({ stalled, protectedManifest }) => {
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
    if (protectedManifest) {
      // Installed packages use an Elgato-protected binary manifest instead of source JSON.
      await writeFile(`${temp}/manifest.json`, Buffer.from("ELGATO\x01\x00\x20\x82\x00"));
    }
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
      {
        cwd: temp,
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, STALL_CHECKPOINTS: stalled ? "1" : "" },
      },
    );
    const dimSockets: WebSocket[] = [];
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    try {
      const [socket] = await Promise.race([
        connection,
        delay(2000, undefined, { ref: false }).then(() => {
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
              payload: {
                settings: { setupDate: "2026-01-01", authentication: { paired: "saved-token" } },
              },
            }),
          );
        }
      });
      await expect.poll(() => messages.some((m) => m.event === "registerPlugin")).toBe(true);
      await expect.poll(() => /DIM_TEST_PORT:(\d+)/.test(output)).toBe(true);
      const port = /DIM_TEST_PORT:(\d+)/.exec(output)![1];
      const version = await fetch(`http://localhost:${port}/version`);
      expect(version.status).toBe(200);
      expect(await version.text()).toBe(manifest.Version);
      for (const instance of ["paired", "unpaired"]) {
        const client = new WebSocket(`ws://localhost:${port}/${instance}`, "dim-status");
        dimSockets.push(client);
        const [raw] = await once(client, "message");
        expect(JSON.parse(raw.toString())).toEqual(
          instance === "paired"
            ? { action: "connected", token: "saved-token" }
            : { action: "connected" },
        );
        if (instance === "unpaired") {
          const confirmed = once(client, "message");
          socket.send(
            JSON.stringify({
              event: "didReceiveDeepLink",
              payload: { url: "/connect?instance=unpaired&token=new-token" },
            }),
          );
          const [status] = await confirmed;
          expect(JSON.parse(status.toString())).toEqual({
            action: "connected",
            token: "new-token",
          });
        }
        const closed = once(client, "close");
        client.close();
        await closed;
      }
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
            messages.find(
              (m) => m.event === "sendToPropertyInspector" && m.payload.id === "request",
            )?.payload,
          { timeout: 7000 },
        )
        .toEqual({ id: "request", status: 200, body: [] });
      // A disconnected action guides the user to setup without opening a tab per press.
      const refresh = { ...event, action: "com.dim.streamdeck.refresh", context: "refresh" };
      socket.send(JSON.stringify({ ...refresh, event: "willAppear" }));
      socket.send(JSON.stringify({ ...refresh, event: "keyDown" }));
      await expect.poll(() => messages.filter((m) => m.event === "openUrl").length).toBe(1);
      socket.send(JSON.stringify({ ...refresh, event: "keyDown" }));
      // A reply confirms the host processed preceding events before checking the count.
      socket.send(
        JSON.stringify({
          ...event,
          event: "sendToPlugin",
          payload: { id: "after-refresh", path: "checkpoints-activities" },
        }),
      );
      await expect
        .poll(() =>
          messages.some(
            (m) => m.event === "sendToPropertyInspector" && m.payload.id === "after-refresh",
          ),
        )
        .toBe(true);
      expect(messages.filter((m) => m.event === "openUrl")).toEqual([
        expect.objectContaining({
          payload: { url: "https://app.destinyitemmanager.com/?streamdeck=setup" },
        }),
      ]);
      // Older DIM sites do not opt in and must not receive the new status action.
      const legacy = new WebSocket(`ws://localhost:${port}/paired`);
      dimSockets.push(legacy);
      const command = once(legacy, "message");
      await once(legacy, "open");
      socket.send(JSON.stringify({ ...refresh, event: "keyDown" }));
      const [rawCommand] = await command;
      expect(JSON.parse(rawCommand.toString())).toEqual({
        action: "refresh",
        token: "saved-token",
      });
      // Exercise the browser through the packaged plugin's real SDK/WebSocket transport.
      const browser = {
        ...event,
        action: "com.dim.streamdeck.loadout-browser",
        context: "browser",
      };
      socket.send(JSON.stringify({ ...browser, event: "willAppear" }));
      socket.send(JSON.stringify({ ...browser, event: "keyDown" }));
      await expect
        .poll(() =>
          messages.some((m) => m.event === "switchToProfile" && m.payload.profile === "DIM"),
        )
        .toBe(true);
      const requestMessage = once(legacy, "message");
      for (let row = 0; row < 3; row++) {
        for (let column = 0; column < 5; column++) {
          socket.send(
            JSON.stringify({
              ...event,
              event: "willAppear",
              action: "com.dim.streamdeck.tile",
              context: `tile-${row}-${column}`,
              payload: { ...event.payload, coordinates: { row, column } },
            }),
          );
        }
      }
      const [requestRaw] = await requestMessage;
      const request = JSON.parse(requestRaw.toString());
      expect(request).toMatchObject({
        action: "requestLoadouts",
        device: "deck",
        token: "saved-token",
      });
      legacy.send(
        JSON.stringify({
          action: "loadouts",
          data: {
            device: "deck",
            requestId: request.requestId,
            currentCharacter: "character",
            loadouts: [
              {
                loadout: "raid-build",
                character: "character",
                classType: 1,
                label: "Raid",
                tags: ["#raid"],
              },
            ],
          },
        }),
      );
      await expect
        .poll(() =>
          messages.some(
            (m) =>
              m.event === "setTitle" &&
              m.context === "tile-0-0" &&
              m.payload.title === "Raid\nhunter",
          ),
        )
        .toBe(true);
      const equipMessage = once(legacy, "message");
      socket.send(
        JSON.stringify({
          ...event,
          event: "keyUp",
          action: "com.dim.streamdeck.tile",
          context: "tile-0-0",
        }),
      );
      const [equipRaw] = await equipMessage;
      expect(JSON.parse(equipRaw.toString())).toEqual({
        action: "equipLoadout",
        loadout: "raid-build",
        character: "character",
        token: "saved-token",
      });
      expect(child.exitCode).toBeNull();
    } catch (error) {
      for (const file of await readdir(`${temp}/logs`).catch(() => [])) {
        console.error((await readFile(`${temp}/logs/${file}`, "utf8")).slice(-3000));
      }
      throw error;
    } finally {
      for (const client of dimSockets) client.terminate();
      if (child.exitCode === null) {
        child.kill();
        await once(child, "exit");
      }
      for (const socket of server.clients) socket.terminate();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await rm(temp, { recursive: true, force: true });
    }
  },
  15000,
);
