import { DIM } from "@/dim/api";
import { action, SingletonAction } from "@elgato/streamdeck";

/**
 * Trigger the refresh action on DIM.
 */
@action({ UUID: "com.dim.streamdeck.refresh" })
export class Refresh extends SingletonAction {
  async onKeyDown() {
    DIM.refresh();
  }
}
