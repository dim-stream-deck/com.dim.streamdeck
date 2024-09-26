import { DIM } from "@/dim/api";
import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { Schemas } from "@plugin/types";
import { log } from "@/util/logger";

/**
 * Trigger a search on DIM.
 */
@action({ UUID: "com.dim.streamdeck.search" })
export class Search extends SingletonAction {
  async onKeyDown(e: KeyDownEvent) {
    const { query, behavior, page } = Schemas.search(e.payload.settings);
    DIM.search({
      query,
      page,
      pullItems: behavior === "pull",
      sendToVault: behavior === "send-to-vault",
    });
    // log action
    log("search");
  }
}
