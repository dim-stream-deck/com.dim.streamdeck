import $ from "@elgato/streamdeck";
import { Cache } from "@fcannizzaro/stream-deck-cache";

export const cache = Cache<string>({
  log: $.logger.info,
  onError: $.logger.error,
  defaultValue: "",
});
