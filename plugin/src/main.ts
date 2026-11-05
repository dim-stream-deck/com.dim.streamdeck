import { WebSocketServer } from "ws";
import $ from "@elgato/streamdeck";
import { setGlobalSettings } from "./settings";
import { z } from "zod";
import { WebSocket } from "ws";
import http from "http";
import { State, reloadEquipment } from "./state";
import { GlobalSettings } from "@plugin/types";
import { DimMessageSchema } from "./dim/message";
import { log } from "@/util/logger";
import { ev } from "@/util/ev";
import { setProperty } from "dot-prop";

// Disable SSL verification
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const server = http.createServer();

server.on("request", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.url === "/version") {
    res.end($.info.plugin.version);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

reloadEquipment();

// In-memory storage of tokens
const tokens = new Map<string, string>();

// Load tokens from the global settings
const settingsLoaded = $.settings.getGlobalSettings<GlobalSettings>().then((settings) => {
  Object.entries(settings.authentication ?? {}).forEach(([instance, token]) => {
    if (!tokens.has(instance)) tokens.set(instance, token);
  });
  // Setup install date
  if (!settings.setupDate) {
    setGlobalSettings({ setupDate: new Date().toString() });
    log("install", {
      os: $.info.application.platform,
      version: $.info.plugin.version,
    });
  }
});

const ws = new WebSocketServer({
  server,
});

server.listen(9120, "localhost");

// Opt in through a WebSocket subprotocol so older DIM clients receive no new messages.
const statusClients = new WeakSet<WebSocket>();

// Confirm authorization without waiting for a button press.
const sendConnectionStatus = (socket: WebSocket) => {
  if (statusClients.has(socket) && socket.readyState === WebSocket.OPEN && socket.instance) {
    socket.send(JSON.stringify({ action: "connected", token: tokens.get(socket.instance) }));
  }
};

// Handle new connections and messages from the client
ws.on("connection", (socket: WebSocket, req) => {
  // set the instance id on the socket
  socket.instance = req.url?.split("/").pop();
  if (
    req.headers["sec-websocket-protocol"]?.split(",").some((value) => value.trim() === "dim-status")
  ) {
    statusClients.add(socket);
  }
  settingsLoaded
    .then(() => sendConnectionStatus(socket))
    .catch((error) => {
      $.logger.error("Failed to load DIM authorization", error);
    });
  // watch for messages from the client
  socket.on("message", async (msg) => {
    const { action, data } = DimMessageSchema.parse(JSON.parse(msg.toString()));
    // log the action
    $.logger.info(`Received ${action} from ${socket.instance}`);
    // update global settings
    switch (action) {
      case "farmingMode":
        State.set({ farmingMode: data });
        break;
      case "state":
        State.set(data);
        reloadEquipment();
        break;
      case "perks":
        State.set({ perks: data });
        break;
      case "loadouts":
        ev.emit(`loadouts:${data.device}`, data);
        break;
      case "pickerItems":
        ev.emit(`pickerItems:${data.device}`, data.items);
        break;
    }
    // update buttons
    ev.emit(action);
  });
});

// Enhance the data sent to the client with the token and broadcast it to all clients
ev.on("send-to-client", (data = {}) => {
  ws.clients.forEach((client: WebSocket) => {
    if (client.readyState === 1 && client.instance) {
      const token = tokens.get(client.instance);
      client.send(
        JSON.stringify({
          ...data,
          token,
        }),
      );
    }
  });
});

let lastSetupOpened = -Infinity;

/**
 * Send data to the client
 *
 * @param data the content to send to the client
 * @returns void
 */
export const sendToWeb = (data: Record<string, string | boolean | number | undefined>) => {
  const connected = [...ws.clients].some((client) => client.readyState === WebSocket.OPEN);
  if (!connected) {
    // Closing an inspector or loading perk metadata must not open a browser tab.
    const interaction =
      data.action !== "requestPerks" && (data.action !== "selection" || Boolean(data.type));
    if (interaction && Date.now() - lastSetupOpened >= 30_000) {
      lastSetupOpened = Date.now();
      $.system.openUrl("https://app.destinyitemmanager.com/?streamdeck=setup");
    }
    return;
  }
  ev.emit("send-to-client", data);
};

// Authentication Validator
const Auth = z.object({
  instance: z.string(),
  token: z.string(),
});

// Handle authentication received from the client
ev.on("connect", async (data) => {
  const { instance, token } = Auth.parse(data);
  // in-memory storage of tokens
  tokens.set(instance, token);
  for (const socket of ws.clients) {
    if (socket.instance === instance) sendConnectionStatus(socket);
  }
  // persist tokens to the global settings
  setGlobalSettings({
    authentication: {
      [instance]: token,
    },
  });
});

const Booleans = ["true", "false"];

ev.on("selection", (params: Record<string, string>) => {
  const data: Record<string, string | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (key.includes(".")) {
      setProperty(data, key, value);
    } else {
      data[key] = Booleans.includes(value) ? value === "true" : value;
    }
  }

  $.ui.sendToPropertyInspector({ event: "selection", settings: data });
});
