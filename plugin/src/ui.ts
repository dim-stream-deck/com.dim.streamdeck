import streamDeck from "@elgato/streamdeck";
import { z } from "zod";
import { getActivitiesDefinitions } from "./actions/checkpoint/manager";
import { updateSoloService } from "./actions/solo-mode/solo-mode";

const Request = z.discriminatedUnion("path", [
  z.object({ id: z.string(), path: z.literal("checkpoints-activities") }),
  z.object({
    id: z.string(),
    path: z.literal("update-solo-service"),
    body: z.enum(["install", "remove"]),
  }),
]);

streamDeck.ui.onSendToPlugin(async ({ payload, action }) => {
  const request = Request.safeParse(payload);
  if (!request.success) return;
  const { id, path } = request.data;
  try {
    const body =
      path === "checkpoints-activities"
        ? getActivitiesDefinitions()
        : await updateSoloService(request.data.body);
    if (streamDeck.ui.action?.id === action.id) {
      await streamDeck.ui.sendToPropertyInspector({ id, status: 200, body: body ?? null });
    }
  } catch (error) {
    streamDeck.logger.error("Property inspector request failed", error);
    if (streamDeck.ui.action?.id === action.id) {
      await streamDeck.ui.sendToPropertyInspector({ id, status: 500 });
    }
  }
});
