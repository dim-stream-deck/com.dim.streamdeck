import { KeyDown } from "@/settings";
import $, { action, SingletonAction } from "@elgato/streamdeck";
import { grid } from "./tile";
import { Cell } from "./GridHelper";
import { next } from "@/util/cyclic";
import { ElementDefinition, Elements, WeaponButtons } from "./constant";
import { DIM } from "@/dim/api";
import { ev } from "@/main";
import { DimMessage, PickerItemsMessage } from "@/dim/message";
import { bungify } from "@/util/cache";
import { ItemIcon } from "../pull-item/item-icon";

const Profiles = [
  "",
  "-Mini",
  "-XL",
  "",
  undefined,
  undefined,
  undefined,
  "-Plus",
];

/**
 * Show a item picker
 */
@action({ UUID: "com.dim.streamdeck.picker" })
export class Picker extends SingletonAction {
  async onKeyDown(e: KeyDown) {
    const device = $.devices.getDeviceById(e.deviceId);

    if (!device || device.type === undefined) {
      return;
    }

    const suffix = Profiles[device.type];
    const size = device.size;

    if (suffix === undefined || !size) {
      return;
    }

    const events = grid.init(size.rows, size.columns);

    const [elementBtn, weaponBtn] = grid.lastRow();

    let element: string | number | undefined;
    let weapon: number | undefined;

    grid.fill(WeaponButtons);

    const updateItems = () => {
      if (element && weapon) {
        DIM.requestPickerItems({
          device: e.deviceId,
          element: ElementDefinition[element],
          weapon,
        });
      }
    };

    grid.updateButton(elementBtn, {
      id: "all",
      image: `./imgs/canvas/picker/element/all.png`,
      type: "element",
    });

    const pickerItemsListener = async (items: Record<string, any>[]) => {
      console.log(items);
      grid.fill(
        await Promise.all(
          items.map(async (item: any) => ({
            id: item.item,
            image: await ItemIcon(item),
            title: "",
            type: "item",
          }))
        )
      );
    };

    const key = `pickerItems:${e.deviceId}`;

    ev.on(key, pickerItemsListener);

    ev.on("close", () => ev.removeListener(key, pickerItemsListener));

    events.on("press", (button: Cell) => {
      if (button.type === "element") {
        element = next(button.id, Elements);
        console.log(element);
        grid.updateButton(elementBtn, {
          id: element,
          image: `./imgs/canvas/picker/element/${element}.png`,
        });
        updateItems();
      } else if (button.type === "weapon") {
        grid.fill(WeaponButtons);
      } else if (button.type === "weapon-type") {
        weapon = Number(button.id);
        grid.updateButton(weaponBtn, {
          id: weapon,
          image: button.image,
        });
        //grid.fill([]);
        updateItems();
      }
    });

    await $.profiles.switchToProfile(e.deviceId, `DIM${suffix}`);
  }
}
