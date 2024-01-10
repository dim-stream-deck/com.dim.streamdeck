import { DIM } from "@/dim/api";
import { Cache } from "@/util/cache";
import {
  Action,
  action,
  DidReceiveSettingsEvent,
  SingletonAction,
} from "@elgato/streamdeck";
import { LoadoutIcon } from "./loadout-icon";
import { splitTitle } from "@/util/canvas";
import { WillAppear, KeyDown } from "@/settings";
import { LoadoutSettings, Schemas } from "@plugin/types";

/**
 * Equip a loadout
 */
@action({ UUID: "com.dim.streamdeck.loadout" })
export class Loadout extends SingletonAction {
  private async update(e: Action, settings?: LoadoutSettings) {
    // load settings
    const { loadout, label, inGameIcon, icon } =
      settings ?? Schemas.loadout(await e.getSettings());
    // update the title and image
    e.setTitle(splitTitle(label));
    e.setImage(
      inGameIcon && loadout
        ? await Cache.canvas(loadout, () =>
            inGameIcon ? LoadoutIcon(inGameIcon) : undefined
          )
        : icon
          ? await Cache.imageFromUrl(icon)
          : undefined
    );
  }

  onWillAppear(e: WillAppear) {
    this.update(e.action);
  }

  onKeyDown(e: KeyDown) {
    const settings = Schemas.loadout(e.payload.settings);
    if (!settings.loadout || !settings.character) {
      return e.action.showAlert();
    }
    DIM.equipLoadout({
      loadout: settings.loadout,
      character: settings.character,
    });
  }

  onPropertyInspectorDidAppear() {
    DIM.selection({ type: "loadout" });
  }

  onPropertyInspectorDidDisappear() {
    DIM.selection();
  }

  onDidReceiveSettings(e: DidReceiveSettingsEvent<LoadoutSettings>) {
    this.update(e.action, e.payload.settings);
  }
}
