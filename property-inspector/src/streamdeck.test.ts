import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

class Socket extends EventTarget {
  static current: Socket;
  sent: Record<string, any>[] = [];
  constructor(public url: string) {
    super();
    Socket.current = this;
  }
  send(data: string) {
    this.sent.push(JSON.parse(data));
  }
  receive(event: string, payload: unknown) {
    this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify({ event, payload }) }));
  }
}

const info = {
  application: { platform: "mac" },
  plugin: { uuid: "com.dim.streamdeck" },
  devices: [],
};
const action = {
  action: "com.dim.streamdeck.loadout",
  context: "key",
  device: "deck",
  payload: { settings: {} },
};

async function connect() {
  const { default: client } = await import("./streamdeck");
  window.connectElgatoStreamDeckSocket(
    1234,
    "inspector",
    "registerPropertyInspector",
    JSON.stringify(info),
    JSON.stringify(action),
  );
  Socket.current.dispatchEvent(new Event("open"));
  return client;
}

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("window", {});
  vi.stubGlobal("WebSocket", Socket);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("property inspector protocol", () => {
  it("registers, reads settings and writes the action settings", async () => {
    const client = await connect();
    expect(Socket.current.sent[0]).toEqual({
      event: "registerPropertyInspector",
      uuid: "inspector",
    });
    const settings = client.settings.getSettings();
    await vi.waitFor(() => expect(Socket.current.sent.at(-1)?.event).toBe("getSettings"));
    expect(Socket.current.sent.at(-1)).toEqual({
      event: "getSettings",
      context: "inspector",
      action: action.action,
    });
    Socket.current.receive("didReceiveSettings", { settings: { loadout: "one" } });
    await expect(settings).resolves.toEqual({ loadout: "one" });
    await client.settings.setSettings({ loadout: "two" });
    expect(Socket.current.sent.at(-1)).toMatchObject({
      event: "setSettings",
      action: action.action,
      context: "inspector",
      payload: { loadout: "two" },
    });
  });

  it("routes global settings through the inspector registration, not the plugin UUID", async () => {
    const client = await connect();
    const settings = client.settings.getGlobalSettings();
    await vi.waitFor(() => expect(Socket.current.sent.at(-1)?.event).toBe("getGlobalSettings"));
    expect(Socket.current.sent.at(-1)).toEqual({
      event: "getGlobalSettings",
      context: "inspector",
      action: action.action,
    });
    Socket.current.receive("didReceiveGlobalSettings", { settings: { promptSupport: false } });
    await expect(settings).resolves.toEqual({ promptSupport: false });
    await client.settings.setGlobalSettings({ promptSupport: true });
    expect(Socket.current.sent.at(-1)).toEqual({
      event: "setGlobalSettings",
      context: "inspector",
      action: action.action,
      payload: { promptSupport: true },
    });
  });

  it("keeps concurrent plugin replies separate", async () => {
    const client = await connect();
    const first = client.plugin.fetch("checkpoints-activities");
    const second = client.plugin.fetch("update-solo-service", "install");
    await vi.waitFor(() => expect(Socket.current.sent).toHaveLength(3));
    for (const message of Socket.current.sent.slice(1)) {
      expect(message).toMatchObject({
        event: "sendToPlugin",
        context: "inspector",
        action: action.action,
      });
    }
    const [a, b] = Socket.current.sent.slice(1).map((message) => message.payload);
    Socket.current.receive("sendToPropertyInspector", { id: b.id, status: 200, body: "ok" });
    Socket.current.receive("sendToPropertyInspector", { id: a.id, status: 200, body: [] });
    await expect(first).resolves.toEqual({ ok: true, body: [] });
    await expect(second).resolves.toEqual({ ok: true, body: "ok" });
  });

  it("removes selection listeners when an action inspector unmounts", async () => {
    const client = await connect();
    const listener = vi.fn();
    const subscription = client.plugin.onSelection(listener);
    Socket.current.receive("sendToPropertyInspector", {
      event: "selection",
      settings: { item: "a" },
    });
    subscription.dispose();
    Socket.current.receive("sendToPropertyInspector", {
      event: "selection",
      settings: { item: "b" },
    });
    expect(listener).toHaveBeenCalledExactlyOnceWith({ item: "a" });
  });

  it("rejects requests that never receive a response", async () => {
    vi.useFakeTimers();
    const client = await connect();
    const result = client.plugin.fetch("checkpoints-activities");
    const check = expect(result).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(10000);
    await check;
  });
});
