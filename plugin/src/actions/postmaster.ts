import { DIM } from "@/dim/api";
import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

interface PostmasterSettings {
  postmasterItem: "" | "enhancementPrisms" | "ascendantShards" | "spoils";
  collectPostmaster?: boolean;
  style: "percentage" | "counter";
}

/**
 * Show postmaster contents.
 */
@action({ UUID: "com.dim.streamdeck.postmaster" })
export class Postmaster extends SingletonAction {
  async onKeyDown(e: KeyDownEvent<PostmasterSettings>) {
    if (e.payload.settings.collectPostmaster ?? true) {
      DIM.collectPostmaster();
    }
  }
}
