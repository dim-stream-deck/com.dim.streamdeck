import { DIM } from "@/dim/api";
import { State } from "@/state";
import { Watcher } from "@/util/watcher";
import {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";

type PostmasterType =
  | ""
  | "total"
  | "enhancementPrisms"
  | "ascendantShards"
  | "spoils";

interface PostmasterSettings {
  postmasterItem: PostmasterType;
  collectPostmaster?: boolean;
  style: "percentage" | "counter";
}

/**
 *
 * @param value postmaster item
 * @returns postmaster item or "total" if value is empty
 */
const process = (value?: PostmasterType) =>
  value === "" || !value ? "total" : value;

/**
 * Show postmaster contents.
 */
@action({ UUID: "com.dim.streamdeck.postmaster" })
export class Postmaster extends SingletonAction {
  private watcher = Watcher("state");

  private update(e: Action, settings: PostmasterSettings) {
    const { postmasterItem, style } = settings;
    const postmaster = State.get("postmaster");
    const key = process(postmasterItem);
    const current = postmaster?.[key] ?? "?";
    const value =
      current === "?"
        ? "?"
        : style === "percentage" && key === "total"
          ? `${Math.round((100 * current) / 21)}%`
          : current;

    const state = key === "total" ? 1 : 0;
    e.setTitle(`${value}`, { state });
    e.setImage(`./imgs/canvas/postmaster/${key}.png`, { state });
    e.setState(state);
  }

  async onDidReceiveSettings(e: DidReceiveSettingsEvent<PostmasterSettings>) {
    const { settings } = e.payload;
    this.update(e.action, settings);
  }

  onWillAppear(e: WillAppearEvent<PostmasterSettings>) {
    this.watcher.start(e.action.id, async () => {
      const settings = await e.action.getSettings<PostmasterSettings>();
      this.update(e.action, settings);
    });
  }

  onWillDisappear(e: WillDisappearEvent<PostmasterSettings>) {
    this.watcher.stop(e.action.id);
  }

  onKeyDown(e: KeyDownEvent<PostmasterSettings>) {
    const { postmasterItem, collectPostmaster } = e.payload.settings;
    const canCollect = collectPostmaster ?? false;
    if (canCollect && process(postmasterItem) === "total") {
      DIM.collectPostmaster();
    }
  }
}
