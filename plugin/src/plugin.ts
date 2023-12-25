import $, { LogLevel } from "@elgato/streamdeck";
import { ev } from "@/main";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
$.logger.setLevel(LogLevel.TRACE);

// Register all the actions in the `actions` directory.
import "@/actions";

// Finally, connect to the Stream Deck.
$.connect();

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
