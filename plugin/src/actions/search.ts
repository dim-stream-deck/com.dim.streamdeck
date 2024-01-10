import { DIM } from "@/dim/api";
import { action, SingletonAction } from "@elgato/streamdeck";
import { Schemas } from "@plugin/types";
import { KeyDown } from "@/settings";

/**
 * Trigger a search on DIM.
 */
@action({ UUID: "com.dim.streamdeck.search" })
export class Search extends SingletonAction {
  async onKeyDown(e: KeyDown) {
    const { query, behavior, page } = Schemas.search(e.payload.settings);
    DIM.search({
      query,
      page,
      pullItems: behavior === "pull",
      sendToVault: behavior === "send-to-vault",
    });
  }
}
