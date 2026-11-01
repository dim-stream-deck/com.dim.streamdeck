import $ from "@elgato/streamdeck";
import { ev } from "@/util/ev";

// Register all the actions in the `actions` directory.
import "@/actions";
import "./ui";
import {
  loadActivities,
  updateCheckpointsBots,
} from "./actions/checkpoint/manager";

// Connect before loading optional checkpoint data.
$.connect().then(async () => {
  await loadActivities();
  await updateCheckpointsBots();
}).catch((err) => $.logger.error("Plugin startup failed", err));

// Propagate the deep link to internal event emitter
$.system.onDidReceiveDeepLink((link) => {
  const query = Object.fromEntries(link.url.queryParameters);
  const action = link.url.path.slice(1);
  ev.emit(action, query);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception: ", err);
  $.logger.error("Uncaught Exception: ", err);
});
