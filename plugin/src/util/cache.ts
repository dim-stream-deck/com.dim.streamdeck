import { Cache } from "@/lib/cache";
import $ from "@elgato/streamdeck";

export const cache = Cache<string>({
  log: $.logger.info.bind($.logger),
  onError: $.logger.error.bind($.logger),
  defaultValue: "",
});
