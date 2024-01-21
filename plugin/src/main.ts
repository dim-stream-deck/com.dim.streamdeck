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

const server = http.createServer();

server.on("request", (req, res) => {
  if (req.url === "/version") {
    res.writeHead(200, { "Access-Control-Allow-Origin": "*" });
    res.end(manifest.Version);
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
    setGlobalSettings({ setupDate: new Date() });
    log("install", {
      os: $.info.application.platform,
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
