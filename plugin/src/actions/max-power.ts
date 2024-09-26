import { DIM } from "@/dim/api";
import { State } from "@/state";
import { log } from "@/util/logger";
import { Watcher } from "@/util/watcher";
import {
	action,
	DidReceiveSettingsEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent
} from "@elgato/streamdeck";
import { MaxPowerSettings, Schemas } from "@plugin/types";

/**
 * Show current character max power and allow to equip it.
 */
@action({ UUID: "com.dim.streamdeck.max-power" })
export class MaxPower extends SingletonAction {
  private watcher = Watcher("state");

  private async update(action: WillAppearEvent["action"], settings?: MaxPowerSettings) {
    const maxPower = State.get("maxPower");
    const { type } = settings ?? Schemas.maxPower(await action.getSettings());
    action.setImage(`./imgs/canvas/max-power/${type}.png`);
    action.setTitle(`${maxPower?.[type] ?? "?"}`);
  }

  onWillAppear(e: WillAppearEvent) {
    this.watcher.start(e.action.id, () => this.update(e.action));
  }

  onWillDisappear(e: WillDisappearEvent) {
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
