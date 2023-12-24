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
  pullItems: boolean;
}

// default search settings
const defaultSettings = {
  page: "inventory",
  pullItems: false,
};

/**
 * Trigger a search on DIM.
 */
@action({ UUID: "com.dim.streamdeck.search" })
export class Search extends SingletonAction<SearchSettings> {
  async onKeyDown(e: KeyDownEvent<SearchSettings>) {
    const { query, search, page, pullItems } = mergeRight(
      defaultSettings,
      e.payload.settings ?? {}
    );
    DIM.search({
      query: query ?? search ?? "",
      page,
      pullItems,
    });
  }
}
