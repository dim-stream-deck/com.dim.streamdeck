import { DIM } from "@/dim/api";
import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { mergeRight } from "ramda";

interface SearchSettings {
  /**
   * @deprecated
   * @see query
   */
  search?: string;
  query: string;
  page: string;
  behavior?: "search" | "pull" | "send-to-vault";
}

// default search settings
const defaultSettings = {
  page: "inventory",
  behavior: "search",
};

/**
 * Trigger a search on DIM.
 */
@action({ UUID: "com.dim.streamdeck.search" })
export class Search extends SingletonAction<SearchSettings> {
  async onKeyDown(e: KeyDownEvent<SearchSettings>) {
    const { query, search, page, behavior } = mergeRight(
      defaultSettings,
      e.payload.settings ?? {}
    );
    DIM.search({
      query: query ?? search ?? "",
      page,
      pullItems: behavior === "pull",
      sendToVault: behavior === "send-to-vault",
    });
  }
}
