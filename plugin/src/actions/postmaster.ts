import { DIM } from "@/dim/api";
import {
  DidReceiveSettings,
  KeyDown,
  WillAppear,
  WillDisappear,
} from "@/settings";
import { State } from "@/state";
import { Watcher } from "@/util/watcher";
import { Action, action, SingletonAction } from "@elgato/streamdeck";
import { Schemas } from "@plugin/types";

/**
 * Show postmaster contents.
 */
@action({ UUID: "com.dim.streamdeck.postmaster" })
export class Postmaster extends SingletonAction {
  private watcher = Watcher("state");

  private async update(e: Action) {
    const { type, style } = Schemas.postmaster(await e.getSettings());
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

  onDidReceiveSettings(e: DidReceiveSettings) {
    this.update(e.action);
  }

  onWillAppear(e: WillAppear) {
    this.watcher.start(e.action.id, () => this.update(e.action));
  }

  onWillDisappear(e: WillDisappear) {
    this.watcher.stop(e.action.id);
  }

  onKeyDown(e: KeyDown) {
    const settings = Schemas.postmaster(e.payload.settings);
    if (settings.type === "total" && settings.collectPostmaster) {
      DIM.collectPostmaster();
    }
  }
}
