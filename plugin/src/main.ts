import { WebSocketServer } from "ws";
import $ from "@elgato/streamdeck";
import { setGlobalSettings } from "./settings";
import { z } from "zod";
import { WebSocket } from "ws";
import http from "http";
import { manifest } from "./util/version";
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
    res.end(manifest.Version);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

reloadEquipment();

// In-memory storage of tokens
const tokens = new Map<string, string>();

// Load tokens from the global settings
$.settings.getGlobalSettings<GlobalSettings>().then((settings) => {
  Object.entries(settings.authentication ?? {}).forEach(([instance, token]) => {
    tokens.set(instance, token);
  });
  // Setup install date
  if (!settings.setupDate) {
    setGlobalSettings({ setupDate: new Date().toString() });
    log("install", {
      os: $.info.application.platform,
      version: manifest.Version,
    });
  }
});

const ws = new WebSocketServer({
  server,
});

server.listen(9120, "localhost");

// Handle new connections and messages from the client
ws.on("connection", (socket: WebSocket, req) => {
  // set the instance id on the socket
  socket.instance = req.url?.split("/").pop();
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
        })
      );
    }
  });
});

/**
 * Send data to the client
 *
 * @param data the content to send to the client
 * @returns void
 */
export const sendToWeb = (
  data: Record<string, string | boolean | number | undefined>
) => ev.emit("send-to-client", data);

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

  $.ui.current?.fetch("/selection", data);
});
