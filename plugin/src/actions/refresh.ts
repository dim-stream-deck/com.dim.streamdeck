import { DIM } from "@/dim/api";
import { log } from "@/util/logger";
import { action, SingletonAction } from "@elgato/streamdeck";

/**
 * Trigger the refresh action on DIM.
 */
@action({ UUID: "com.dim.streamdeck.refresh" })
export class Refresh extends SingletonAction {
  async onKeyDown() {
    DIM.refresh();
    // log action
    log("refresh");
  }
}
