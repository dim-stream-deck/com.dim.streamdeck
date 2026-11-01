import type { JsonObject } from "@elgato/utils";
export type { JsonObject } from "@elgato/utils";

// The SDK no longer ships a browser client. Keep the WebSocket boundary here.
export type ActionInfo = {
  action: string;
  context: string;
  device: string;
  payload: { settings: JsonObject };
};
export type RegistrationInfo = {
  application: { platform: string };
  plugin: { uuid: string };
  devices: { id: string; type: number; size: { rows: number; columns: number } }[];
};
type Message = { event: string; payload: JsonObject };
const listeners = new Map<string, Set<(message: Message) => void>>();
const connected = Promise.withResolvers<{
  socket: WebSocket;
  uuid: string;
  info: RegistrationInfo;
  action: ActionInfo;
}>();

function subscribe(event: string, listener: (message: Message) => void) {
  const group = listeners.get(event) ?? new Set();
  listeners.set(event, group);
  group.add(listener);
  return {
    dispose: () => {
      group.delete(listener);
    },
  };
}

async function send(event: string, payload?: unknown) {
  const { socket, info, action } = await connected.promise;
  socket.send(
    JSON.stringify({
      event,
      context: event.includes("GlobalSettings") ? info.plugin.uuid : action.context,
      ...(["sendToPlugin", "getSettings", "setSettings"].includes(event)
        ? { action: action.action }
        : {}),
      payload,
    }),
  );
}

async function request(
  event: string,
  reply: string,
  payload?: unknown,
  matches: (message: Message) => boolean = () => true,
) {
  await connected.promise;
  return new Promise<Message>((resolve, reject) => {
    const subscription = subscribe(reply, (message) => {
      if (!matches(message)) return;
      clearTimeout(timer);
      subscription.dispose();
      resolve(message);
    });
    const timer = setTimeout(() => {
      subscription.dispose();
      reject(new Error(`Stream Deck request timed out: ${event}`));
    }, 10000);
    send(event, payload).catch((error) => {
      clearTimeout(timer);
      subscription.dispose();
      reject(error);
    });
  });
}

declare global {
  interface Window {
    connectElgatoStreamDeckSocket: (
      port: string | number,
      uuid: string,
      event: string,
      info: string,
      action: string,
    ) => void;
  }
}

window.connectElgatoStreamDeckSocket = (port, uuid, event, rawInfo, rawAction) => {
  const info: RegistrationInfo = JSON.parse(rawInfo);
  const action: ActionInfo = JSON.parse(rawAction);
  const socket = new WebSocket(`ws://127.0.0.1:${port}`);
  socket.addEventListener("message", ({ data }) => {
    const message: Message = JSON.parse(data);
    listeners.get(message.event)?.forEach((listener) => listener(message));
  });
  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ event, uuid }));
    connected.resolve({ socket, uuid, info, action });
  });
  socket.addEventListener("error", () =>
    connected.reject(new Error("Stream Deck connection failed")),
  );
};

export default {
  onConnected(listener: (info: RegistrationInfo, action: ActionInfo) => void) {
    void connected.promise.then(({ info, action }) => listener(info, action));
  },
  system: { openUrl: (url: string) => send("openUrl", { url }) },
  settings: {
    async getSettings<T extends JsonObject>() {
      const message = await request("getSettings", "didReceiveSettings");
      return message.payload.settings as T;
    },
    async getGlobalSettings<T extends JsonObject>() {
      const message = await request("getGlobalSettings", "didReceiveGlobalSettings");
      return message.payload.settings as T;
    },
    setSettings: (settings: JsonObject) => send("setSettings", settings),
    setGlobalSettings: (settings: JsonObject) => send("setGlobalSettings", settings),
    onDidReceiveSettings<T extends JsonObject>(
      listener: (e: { payload: { settings: T } }) => void,
    ) {
      return subscribe("didReceiveSettings", (message) =>
        listener({ payload: { settings: message.payload.settings as T } }),
      );
    },
    onDidReceiveGlobalSettings<T extends JsonObject>(listener: (e: { settings: T }) => void) {
      return subscribe("didReceiveGlobalSettings", (message) =>
        listener({ settings: message.payload.settings as T }),
      );
    },
  },
  plugin: {
    async fetch(path: string, body?: string) {
      const id = crypto.randomUUID();
      const response = await request(
        "sendToPlugin",
        "sendToPropertyInspector",
        { id, path, body },
        (message) => message.payload.id === id,
      );
      return { ok: response.payload.status === 200, body: response.payload.body };
    },
    onSelection(listener: (settings: JsonObject) => void) {
      return subscribe("sendToPropertyInspector", (message) => {
        if (message.payload.event === "selection") listener(message.payload.settings as JsonObject);
      });
    },
  },
};
