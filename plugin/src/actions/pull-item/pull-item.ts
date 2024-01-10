import { DIM } from "@/dim/api";
import { Gestures, GestureType } from "@/util/gestures";
import $, {
  Action,
  action,
  DidReceiveSettingsEvent,
  SingletonAction,
} from "@elgato/streamdeck";
import { ItemIcon } from "./item-icon";
import { Cache } from "@/util/cache";
import { Watcher } from "@/util/watcher";
import { splitTitle } from "@/util/canvas";
import { PullItemSettings, Schemas } from "@plugin/types";
import {
  KeyDown,
  KeyUp,
  WillAppear,
  WillDisappear,
} from "@/settings";
import { Equipment } from "@/state";

export type AltAction = "hold" | "double" | undefined;

const GestureMapping = {
  single: "pullItemSinglePress",
  double: "pullItemDoublePress",
  hold: "pullItemHoldPress",
} as const;

/**
 * Pulls an item from/to the vault or other characters.
 */
@action({ UUID: "com.dim.streamdeck.pull-item" })
export class PullItem extends SingletonAction {
  private gestures = Gestures();
  private watcher = Watcher("equipmentStatus");

  private async update(e: Action, settings?: PullItemSettings) {
    const { item: id, ...item } =
      settings ?? Schemas.pullItem(await e.getSettings());

    if (!id || !item.icon) {
      return;
    }

    const { equipmentGrayscale = true } = Schemas.global(
      await $.settings.getGlobalSettings()
    );

    const equipped = Equipment.has(id);

    const image = await Cache.canvas(
      `${id}/${equipped}/${equipmentGrayscale}`,
      () =>
        item.icon && id
          ? ItemIcon(
              {
                ...item,
                equipped,
              },
              {
                grayscale: equipmentGrayscale,
              }
            )
          : undefined
    );

    e.setTitle(item.isSubClass ? splitTitle(item.label) : undefined);
    e.setImage(image);
  }

  onWillAppear(e: WillAppear) {
    this.update(e.action);

    this.watcher.start(e.action.id, () => this.update(e.action));

    this.gestures.start(e.action.id, async (gesture: GestureType) => {
      const global = Schemas.global(await $.settings.getGlobalSettings());
      const settings = Schemas.pullItem(await e.action.getSettings());

      if (!settings.item) {
        return e.action.showAlert();
      }

      let type = global[GestureMapping[gesture]] ?? "pull";

      // skip useless actions
      if (settings.isSubClass && type !== "equip") {
        return;
      }

      const isInSlots = Equipment.has(settings.item);

      // support toggle action
      if (gesture === "single" && global.pullItemSingleToggle) {
        type = isInSlots ? "vault" : type;
      }

      // send action to DIM
      DIM.pullItem({
        itemId: settings.item,
        type,
      });

      e.action.showOk();
    });
  }

  onWillDisappear(e: WillDisappear) {
    this.gestures.stop(e.action.id);
    this.watcher.stop(e.action.id);
  }

  onDidReceiveSettings(e: DidReceiveSettingsEvent<PullItemSettings>) {
    this.update(e.action, e.payload.settings);
  }

  onKeyUp(e: KeyUp) {
    this.gestures.keyUp(e.action.id);
  }

  onKeyDown(e: KeyDown) {
    this.gestures.keyDown(e.action.id);
  }

  onPropertyInspectorDidAppear() {
    DIM.selection({ type: "item" });
  }

  onPropertyInspectorDidDisappear() {
    DIM.selection();
  }
}
