import { DIM } from "@/dim/api";
import { Cache } from "@/util/cache";
import {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { LoadoutIcon } from "./loadout-icon";
import { splitEvery } from "ramda";

interface LoadoutSettings {
  loadout?: string;
  label?: string;
  subtitle?: string;
  icon?: string;
  character?: string;
  inGameIcon?: {
    background: string;
    icon: string;
  };
}

/**
 * Equip a loadout
 */
@action({ UUID: "com.dim.streamdeck.loadout" })
export class Loadout extends SingletonAction {
  private async update(e: Action, settings: LoadoutSettings) {
    e.setTitle(splitEvery(6, settings.label ?? "").join("\n"));
    e.setImage(
      settings.inGameIcon && settings.loadout
        ? await Cache.canvas(settings.loadout, () =>
            settings.inGameIcon ? LoadoutIcon(settings.inGameIcon) : undefined
          )
        : settings.icon
          ? await Cache.imageFromUrl(settings.icon)
          : undefined
    );
  }

  onWillAppear(e: WillAppearEvent<LoadoutSettings>) {
    this.update(e.action, e.payload.settings);
  }

  onKeyDown(e: KeyDownEvent<LoadoutSettings>) {
    const settings = e.payload.settings;
    if (!settings.loadout || !settings.character) {
      return e.action.showAlert();
    }
    DIM.equipLoadout({
      loadout: settings.loadout,
      character: settings.character,
    });
  }

  onDidReceiveSettings(e: DidReceiveSettingsEvent<LoadoutSettings>) {
    this.update(e.action, e.payload.settings);
  }

  onPropertyInspectorDidAppear() {
    DIM.selection({ type: "loadout" });
  }

  onPropertyInspectorDidDisappear() {
    DIM.selection();
  }
}
