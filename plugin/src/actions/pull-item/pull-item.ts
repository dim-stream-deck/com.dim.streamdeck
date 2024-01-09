import { DIM } from "@/dim/api";
import { ev } from "@/main";
import { Gestures, GestureType } from "@/util/gestures";
import $, {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  KeyUpEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { ItemIcon } from "./item-icon";
import { Equipment } from "@/util/equipment";
import { Cache } from "@/util/cache";
import { Watcher } from "@/util/watcher";
import { splitTitle } from "@/util/canvas";
import { GlobalSettings, PullItemSettings } from "@plugin/types";

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

  private async update(e: Action, settings: PullItemSettings) {
    if (!settings.item || !settings.icon) {
      return;
    }

    const { equipmentGrayscale = true } =
      await $.settings.getGlobalSettings<GlobalSettings>();

    const equipped = Equipment.has(settings.item);

    const image = await Cache.canvas(
      `${settings.item}/${equipped}/${equipmentGrayscale}`,
      () =>
        settings.icon && settings.item
          ? ItemIcon(
              {
                base: settings.icon,
                overlay: settings.overlay,
                element: settings.element,
                isExotic: settings.isExotic,
                isSubClass: settings.isSubClass,
                equipped,
              },
              {
                grayscale: equipmentGrayscale,
              }
            )
          : undefined
    );

    e.setTitle(settings.isSubClass ? splitTitle(settings.label) : undefined);
    e.setImage(image);
  }

  onWillAppear(e: WillAppearEvent<PullItemSettings>) {
    const settings = e.payload.settings;

    if (settings.item) {
      ev.on(settings.item, () => this.update(e.action, settings));
      this.update(e.action, settings);
    }

    this.watcher.start(e.action.id, async (data) => {
      const settings = await e.action.getSettings<PullItemSettings>();
      if (data?.itemId === settings.item) {
        this.update(e.action, settings);
      }
    });

    this.gestures.start(e.action.id, async (gesture: GestureType) => {
      const settings = await e.action.getSettings<PullItemSettings>();
      const global = await $.settings.getGlobalSettings<GlobalSettings>();

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

  onWillDisappear(e: WillDisappearEvent<PullItemSettings>) {
    this.gestures.stop(e.action.id);
    this.watcher.stop(e.action.id);
  }

  onDidReceiveSettings(e: DidReceiveSettingsEvent<PullItemSettings>) {
    this.update(e.action, e.payload.settings);
  }

  onKeyUp(e: KeyUpEvent<PullItemSettings>) {
    this.gestures.keyUp(e.action.id);
  }

  onKeyDown(e: KeyDownEvent<PullItemSettings>) {
    this.gestures.keyDown(e.action.id);
  }

  onPropertyInspectorDidAppear() {
    DIM.selection({ type: "item" });
  }

  onPropertyInspectorDidDisappear() {
    DIM.selection();
  }
}
