import { DIM } from "@/dim/api";
import { State } from "@/state";
import { log } from "@/util/logger";
import { Watcher } from "@/util/watcher";
import {
  action,
  DidReceiveSettingsEvent,
  KeyAction,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { PostmasterSettings, Schemas } from "@plugin/types";

/**
 * Show postmaster contents.
 */
@action({ UUID: "com.dim.streamdeck.postmaster" })
export class Postmaster extends SingletonAction {
  private watcher = Watcher("state");

  private async update(e: KeyAction, settings?: PostmasterSettings) {
    const { type, style } =
      settings ?? Schemas.postmaster(await e.getSettings());
    const postmaster = State.get("postmaster");
    const current = postmaster?.[type] ?? "?";
    const value =
      current === "?"
        ? "?"
        : type === "total" && style === "percentage"
          ? `${Math.round((100 * current) / 21)}%`
          : current;

    const state = type === "total" ? 1 : 0;
    e.setTitle(`${value}`, { state });
    e.setImage(`./imgs/canvas/postmaster/${type}.png`, { state });
    e.setState(state);
  }

  onDidReceiveSettings(e: DidReceiveSettingsEvent<PostmasterSettings>) {
    if (e.action.isKey()) {
      this.update(e.action, e.payload.settings);
    }
  }

  onWillAppear(e: WillAppearEvent) {
    if (e.action.isKey()) {
      this.watcher.start(e.action.id, () => this.update(e.action as KeyAction));
    }
  }

  onWillDisappear(e: WillDisappearEvent) {
    this.watcher.stop(e.action.id);
  }

  onKeyDown(e: KeyDownEvent) {
    const settings = Schemas.postmaster(e.payload.settings);
    if (settings.type === "total" && settings.collectPostmaster) {
      DIM.collectPostmaster();
    }
    // log action
    log("postmaster");
  }
}
