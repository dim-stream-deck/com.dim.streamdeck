import { DIM } from "@/dim/api";
import {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { LoadoutIcon } from "./loadout-icon";
import { splitTitle } from "@/util/canvas";
import { LoadoutSettings, Schemas } from "@plugin/types";
import { log } from "@/util/logger";
import { bungify } from "@/util/images";
import { downloadAsBase64 } from "@/lib/image";

/**
 * Equip a loadout
 */
@action({ UUID: "com.dim.streamdeck.loadout" })
export class Loadout extends SingletonAction {
  private async update(
    e: WillAppearEvent["action"],
    settings?: LoadoutSettings
  ) {
    // load settings
    const { label, inGameIcon, icon } =
      settings ?? Schemas.loadout(await e.getSettings());
    // update the title and image
    e.setTitle(splitTitle(label));
    e.setImage(
      (inGameIcon
        ? await LoadoutIcon(inGameIcon)
        : icon && (await downloadAsBase64(bungify(icon)))) ?? undefined
    );
  }

  onWillAppear(e: WillAppearEvent) {
    this.update(e.action);
  }

  onKeyDown(e: KeyDownEvent) {
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
