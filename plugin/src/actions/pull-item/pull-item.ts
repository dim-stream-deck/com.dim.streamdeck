import { DIM } from "@/dim/api";
import { Gestures, GestureType } from "@/util/gestures";
import $, {
  Action,
  action,
  DidReceiveSettingsEvent,
  SendToPluginEvent,
  SingletonAction,
} from "@elgato/streamdeck";
import { ItemIcon } from "./item-icon";
import { Cache } from "@/util/cache";
import { Watcher } from "@/util/watcher";
import { splitTitle } from "@/util/canvas";
import { PullItemSettings, Schemas } from "@plugin/types";
import { KeyDown, KeyUp, WillAppear, WillDisappear } from "@/settings";
import { Equipment } from "@/state";
import { ev } from "@/util/ev";
import { Loaders } from "@/util/images";
import { log } from "@/util/logger";

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

    const cacheKey = [item.icon, equipmentGrayscale, equipped];

    const image = ItemIcon(item, {
      equipped,
      grayscale: equipmentGrayscale,
    });

    // show a loader if the image is not ready
    if (!item.isSubClass && !Cache.has(cacheKey)) {
      const type = item.isExotic ? "exotic" : "legendary";
      await e.setImage(Loaders[`${type}Grayscale`]);
    }

    e.setTitle(item.isSubClass ? splitTitle(item.label) : undefined);
    e.setImage(await image);
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
      if (type === "pull" && global.pullItemSingleToggle) {
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
    // log action
    log("pull-item");
  }

  onPropertyInspectorDidAppear() {
    DIM.selection({ type: "item" });
  }

  onPropertyInspectorDidDisappear() {
    DIM.selection();
  }

  onSendToPlugin(e: SendToPluginEvent<{}, {}>) {
    ev.emit("equipmentStatus");
  }
}
