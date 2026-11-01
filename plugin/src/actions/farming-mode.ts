import type { JsonObject } from "@elgato/utils";
import { DIM } from "@/dim/api";
import { Watcher } from "@/util/watcher";
import { State } from "@/state";
import { log } from "@/util/logger";
import {
  action,
  KeyAction,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";

/**
 * Toggle the farming mode on DIM.
 */
@action({ UUID: "com.dim.streamdeck.farming-mode" })
export class FarmingMode extends SingletonAction {
  private watcher = Watcher("farmingMode");

  private update(e: KeyAction<JsonObject>) {
    const farmingMode = State.get("farmingMode");
    e.setState(farmingMode ? 1 : 0);
  }

  onWillAppear(e: WillAppearEvent) {
    if (e.action.isKey()) {
      const key = e.action;
      this.watcher.start(key.id, () => this.update(key));
    }
  }

  onWillDisappear(e: WillDisappearEvent) {
    this.watcher.stop(e.action.id);
  }

  onKeyUp() {
    DIM.toggleFarmingMode();
    // log action
    log("farming-mode");
  }
}
