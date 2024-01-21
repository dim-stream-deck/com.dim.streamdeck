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
import { downloadAsArrayBuffer, toBase64 } from "@/util/images";
import { log } from "@/util/logger";

/**
 * Equip a loadout
 */
@action({ UUID: "com.dim.streamdeck.loadout" })
export class Loadout extends SingletonAction {
  private async update(e: Action, settings?: LoadoutSettings) {
    // load settings
    const { label, inGameIcon, icon } =
      settings ?? Schemas.loadout(await e.getSettings());
    // update the title and image
    e.setTitle(splitTitle(label));
    e.setImage(
      inGameIcon
        ? await LoadoutIcon(inGameIcon)
        : icon
          ? toBase64(await downloadAsArrayBuffer(icon), "image/png")
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
    // log action
    log("loadout");
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
