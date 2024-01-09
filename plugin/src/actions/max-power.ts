import { DIM } from "@/dim/api";
import { MaxPowerType, State } from "@/state";
import { Watcher } from "@/util/watcher";
import {
  Action,
  action,
  DidReceiveSettingsEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";

interface MaxPowerSettings {
  powerType?: MaxPowerType | "all";
}

/**
 * Show current character max power and allow to equip it.
 */
@action({ UUID: "com.dim.streamdeck.max-power" })
export class MaxPower extends SingletonAction {
  private watcher = Watcher("state");

  private update(action: Action, settings: MaxPowerSettings) {
    const maxPower = State.get("maxPower");
    const powerType = settings.powerType ?? "total";
    if (powerType !== "all") {
      action.setImage(`./imgs/canvas/max-power/${powerType}.png`);
      action.setTitle(`${maxPower?.[powerType] ?? "?"}`);
    }
  }

  async onDidReceiveSettings(ev: DidReceiveSettingsEvent<MaxPowerSettings>) {
    this.update(ev.action, ev.payload.settings);
  }

  async onWillAppear(e: WillAppearEvent<MaxPowerSettings>) {
    this.watcher.start(e.action.id, async () => {
      const settings = await e.action.getSettings<MaxPowerSettings>();
      this.update(e.action, settings);
    });
  }

  onWillDisappear(e: WillDisappearEvent<MaxPowerSettings>) {
    this.watcher.stop(e.action.id);
  }

  onKeyDown() {
    DIM.equipMaxPower();
  }
}
