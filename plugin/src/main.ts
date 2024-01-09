import EventEmitter from "events";
import { WebSocketServer } from "ws";
import $ from "@elgato/streamdeck";
import { setGlobalSettings } from "./settings";
import { z } from "zod";
import { WebSocket } from "ws";
import { toggleEquipment } from "./util/equipment";
import http from "http";
import { manifest } from "./util/version";
import { State, loadEquipment } from "./state";
import { GlobalSettings } from "@plugin/types";

const server = http.createServer();

server.on("request", (req, res) => {
  if (req.url === "/version") {
    res.writeHead(200, { "Access-Control-Allow-Origin": "*" });
    res.end(manifest.Version);
  }
});

export const ev = new EventEmitter();
ev.setMaxListeners(30);
loadEquipment();

// In-memory storage of tokens
const tokens = new Map<string, string>();

// Load tokens from the global settings
$.settings.getGlobalSettings<GlobalSettings>().then((settings) => {
  Object.entries(settings.authentication ?? {}).forEach(([instance, token]) => {
    tokens.set(instance, token);
  });
});

const ws = new WebSocketServer({
  server,
});

server.listen(9120);

const DimMessage = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("farmingMode"),
    data: z.boolean(),
  }),
  z.object({
    action: z.literal("state"),
    data: z.record(z.any()),
  }),
  z.object({
    action: z.literal("equipmentStatus"),
    data: z.object({
      equipped: z.boolean(),
      itemId: z.string(),
    }),
  }),
]);

// Handle new connections and messages from the client
ws.on("connection", (socket: WebSocket, req) => {
  // set the instance id on the socket
  socket.instance = req.url?.split("/").pop();
  // watch for messages from the client
  socket.on("message", async (msg) => {
    const { action, data } = DimMessage.parse(JSON.parse(msg.toString()));
    // log the action
    $.logger.info(`Received ${action} from ${socket.instance}`);
    // update global settings
    switch (action) {
      case "farmingMode":
        State.set({ farmingMode: data });
        break;
      case "state":
        State.set(data);
        break;
      case "equipmentStatus":
        toggleEquipment(data.itemId, data.equipped);
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
