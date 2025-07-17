import { DIM } from "@/dim/api";
import $, {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  KeyUpEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { ItemIcon } from "./item-icon";
import { cache } from "@/util/cache";
import { Watcher } from "@/util/watcher";
import { splitTitle } from "@/util/canvas";
import { PullItemSettings, Schemas } from "@plugin/types";
import { Equipment } from "@/state";
import { Loaders } from "@/util/images";
import { log } from "@/util/logger";
import { Gestures } from "@/lib/gesture";

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

  private async update(
    e: WillAppearEvent["action"],
    settings?: PullItemSettings
  ) {
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
    if (!item.isSubClass && !cache.has(cacheKey)) {
      const type = item.isExotic ? "exotic" : "legendary";
      await e.setImage(Loaders[`${type}Grayscale`]);
    }

    e.setTitle(item.isSubClass ? splitTitle(item.label) : "");
    e.setImage(await image);
  }

  onWillAppear(e: WillAppearEvent) {
    this.update(e.action);

    this.watcher.start(e.action.id, () => this.update(e.action));

    this.gestures.start(e.action.id, async (gesture) => {
      const global = Schemas.global(await $.settings.getGlobalSettings());
      const settings = Schemas.pullItem(await e.action.getSettings());

      if (!settings.item) {
        return e.action.showAlert();
      }

      const gestures = settings.keepGestureLocal ? settings : global;

      let type = gestures[GestureMapping[gesture]] ?? "pull";

      // skip useless actions
      if (settings.isSubClass && type !== "equip") {
        return;
      }

      const isInSlots = Equipment.has(settings.item);

      // support toggle action
      if (type === "pull" && gestures.pullItemSingleToggle) {
        type = isInSlots ? "vault" : type;
      }

      // send action to DIM
      DIM.pullItem({
        itemId: settings.item,
        type,
      });

      (e.action as KeyUpEvent["action"]).showOk();
    });
  }

  onWillDisappear(e: WillDisappearEvent) {
    this.gestures.stop(e.action.id);
    this.watcher.stop(e.action.id);
  }

  onDidReceiveSettings(e: DidReceiveSettingsEvent<PullItemSettings>) {
    this.update(e.action, e.payload.settings);
  }

  onKeyUp(e: KeyUpEvent) {
    this.gestures.keyUp(e.action.id);
  }

  onKeyDown(e: KeyDownEvent) {
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
}
