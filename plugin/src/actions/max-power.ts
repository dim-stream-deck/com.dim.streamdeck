import { DIM } from "@/dim/api";
import { GlobalSettings, MaxPowerType } from "@/settings";
import { Watcher } from "@/util/watcher";
import $, {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { set } from "ramda";

interface MaxPowerSettings {
  powerType?: MaxPowerType | "all";
}

/**
 * Show current character max power and allow to equip it.
 */
@action({ UUID: "com.dim.streamdeck.max-power" })
export class MaxPower extends SingletonAction {
  private watcher = Watcher("state");

  private update(
    action: Action,
    settings: MaxPowerSettings,
    globalSettings: GlobalSettings
  ) {
    const powerType = settings.powerType ?? "total";
    if (powerType !== "all") {
      action.setImage(`./imgs/canvas/max-power/${powerType}.png`);
      action.setTitle(`${globalSettings.maxPower?.[powerType] ?? "?"}`);
    }
  }

  async onDidReceiveSettings(ev: DidReceiveSettingsEvent<MaxPowerSettings>) {
    const globalSettings = await $.settings.getGlobalSettings<GlobalSettings>();
    this.update(ev.action, ev.payload.settings, globalSettings);
  }

  async onWillAppear(e: WillAppearEvent<MaxPowerSettings>) {
    this.watcher.start(e.action.id, async () => {
      const settings = await e.action.getSettings<MaxPowerSettings>();
      this.update(
        e.action,
        settings,
        await $.settings.getGlobalSettings<GlobalSettings>()
      );
    });
  }

  onWillDisappear(e: WillDisappearEvent<MaxPowerSettings>) {
    this.watcher.stop(e.action.id);
  }

  onKeyDown() {
    DIM.equipMaxPower();
  }
}
