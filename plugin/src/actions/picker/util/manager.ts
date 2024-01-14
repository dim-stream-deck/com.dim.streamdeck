import { DIM, buildQuery } from "@/dim/api";
import { Cell, GridHelper } from "../helper/GridHelper";
import {
  Classes,
  CloseWeaponButton,
  Crafted,
  Elements,
  OpenWeaponButton,
  Rarity,
  WeaponButtons,
} from "./options";
import { ItemIcon } from "@/actions/pull-item/item-icon";
import { ev } from "@/main";
import $, { Action } from "@elgato/streamdeck";
import { nextBy } from "@/util/cyclic";
import { PickerCellType, PickerSettings } from "@plugin/types";

export const onPickerActivate = (
  grid: GridHelper<PickerCellType>,
  device: string,
  profile: string,
  settings: PickerSettings,
  action: Action
) => {
  const events = grid.init();
  const buttons = grid.lastRow;

  const Options = {
    element: Elements,
    weapon: WeaponButtons,
    crafted: Crafted,
    perk: [],
    armor: [],
    filters: [],
    rarity: Rarity,
    class: Classes,
  };

  if (settings.options.weapon) {
    const keys = new Set(
      settings.options.weapon.map((it) => it.replace("-", ""))
    );
    Options.weapon = Options.weapon.filter((it) => keys.has(it.id));
  }

  const filters: Record<string, string | undefined> = {
    weapon: "",
    ...settings.defaultOptions,
  };

  settings.filters.forEach((filter, i) => {
    const value = settings.defaultOptions[filter] || "all";
    grid.updateButton(buttons[i], {
      id: "all",
      image: `./imgs/canvas/picker/${filter}/${value}.png`,
      type: filter,
    });
  });

  const queryType = settings.filters.includes("class")
    ? "armor"
    : settings.filters.includes("weapon")
      ? "weapon"
      : "all";

  let next;
  let pickerOpen = false;

  const updateItems = () => {
    pickerOpen = false;
    DIM.requestPickerItems({
      device,
      query: buildQuery(filters, queryType),
    });
  };

  const pickerItemsListener = async (items: Record<string, any>[]) => {
    grid.fill(
      await Promise.all(
        items.map(async (item: any) => ({
          type: "item",
          id: item.item,
          image: () => ItemIcon(item),
          misc: {
            isExotic: item.isExotic,
          },
        }))
      )
    );
  };

  // listen for picker items (from DIM)
  const key = `pickerItems:${device}`;
  ev.on(key, pickerItemsListener);
  ev.on("close", () => ev.removeListener(key, pickerItemsListener));

  updateItems();

  // listen for picker events (from the grid)
  events.on("press", (button: Cell<PickerCellType>) => {
    switch (button.type) {
      case "element":
      case "class":
      case "rarity":
      case "crafted":
        // pick the options
        const options = Options[button.type];
        // cycle through elements
        next = nextBy(button.id, "id", options);
        // refresh the button
        grid.updateButton(button, next);
        // update the filter
        filters[button.type] = next.id;
        // update the grid
        updateItems();
        break;
      case "weapon":
        if (pickerOpen) {
          filters.weapon = "";
          updateItems();
        } else {
          grid.fill(Options.weapon);
          pickerOpen = true;
        }
        grid.updateButton(
          button,
          pickerOpen ? CloseWeaponButton : OpenWeaponButton
        );
        break;
      case "weapon-type":
        // set the weapon filter
        filters.weapon = button.id;
        // refresh the button
        grid.updateButton(button, {
          id: filters.weapon,
          image: button.image,
        });
        // update button filter
        const weaponButton = buttons.find((it) => it.type === "weapon");
        if (weaponButton) {
          grid.updateButton(weaponButton, OpenWeaponButton);
        }
        // update the filter
        updateItems();
        break;
      case "item":
        DIM.pullItem({
          itemId: button.id!,
          type: "pull",
        });
        action.showOk();
        break;
    }
  });

  $.profiles.switchToProfile(device, profile);
};