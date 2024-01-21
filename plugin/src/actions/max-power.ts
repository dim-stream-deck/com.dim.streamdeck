import { DIM } from "@/dim/api";
import { DidReceiveSettings, WillAppear, WillDisappear } from "@/settings";
import { State } from "@/state";
import { log } from "@/util/logger";
import { Watcher } from "@/util/watcher";
import {
  Action,
  action,
  DidReceiveSettingsEvent,
  SingletonAction,
} from "@elgato/streamdeck";
import { MaxPowerSettings, Schemas } from "@plugin/types";

/**
 * Show current character max power and allow to equip it.
 */
@action({ UUID: "com.dim.streamdeck.max-power" })
export class MaxPower extends SingletonAction {
  private watcher = Watcher("state");

  private async update(action: Action, settings?: MaxPowerSettings) {
    const maxPower = State.get("maxPower");
    const { type } = settings ?? Schemas.maxPower(await action.getSettings());
    action.setImage(`./imgs/canvas/max-power/${type}.png`);
    action.setTitle(`${maxPower?.[type] ?? "?"}`);
  }

  onWillAppear(e: WillAppear) {
    this.watcher.start(e.action.id, () => this.update(e.action));
  }

  onWillDisappear(e: WillDisappear) {
    this.watcher.stop(e.action.id);
  }

  onDidReceiveSettings(e: DidReceiveSettingsEvent<MaxPowerSettings>) {
    this.update(e.action, e.payload.settings);
  }

  onKeyDown() {
    DIM.equipMaxPower();
    // log action
    log("max-power");
  }
}
