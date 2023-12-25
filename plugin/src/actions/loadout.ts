import { DIM } from "@/dim/api";
import {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";

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
 * Trigger the refresh action on DIM.
 */
@action({ UUID: "com.dim.streamdeck.loadout" })
export class Loadout extends SingletonAction {
  private update(e: Action, settings: LoadoutSettings) {
    e.setTitle(settings.label);
    e.setImage(settings.icon);
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
      loadoutId: settings.loadout,
      characterId: settings.character,
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
