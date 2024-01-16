import { DIM, buildQuery } from "@/dim/api";
import { Cell, GridHelper } from "../helper/GridHelper";
import {
  Armor,
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
import { State } from "@/state";
import { ImageIcon } from "./ImageIcon";

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
    perk: State.get("perks") ?? [],
    armor: Armor,
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

  const filters: Record<string, string | undefined> = Object.fromEntries(
    settings.filters.map((it) => [it, settings.defaultOptions[it]])
  );

  settings.filters.forEach((filter, i) => {
    const id = filters[filter];
    grid.updateButton(buttons[i], {
      id,
      image: `./imgs/canvas/picker/${filter}/${id}.png`,
      type: filter,
    });
  });

  let next;
  let pickerOpen = false;

  const updateItems = () => {
    pickerOpen = false;
    DIM.requestPickerItems({
      device,
      query: buildQuery(filters, settings.category),
    });
  };

  const pickerItemsListener = async (items: Record<string, any>[]) => {
    grid.fill(
      await Promise.all(
        items.map(async (item: any) => ({
          type: "selection:item",
          title: "",
          id: item.item,
          image: () => ItemIcon(item),
          loadingType: item.isExotic ? "exotic" : "legendary",
        }))
      )
    );
  };

  // listen for picker items (from DIM)
  const key = `pickerItems:${device}`;
  ev.on(key, pickerItemsListener);
  ev.on("close", () => ev.removeListener(key, pickerItemsListener));

  updateItems();

  const weaponButton = buttons.find((it) => it.type === "weapon");
  const perkButton = buttons.find((it) => it.type === "perk");

  // listen for picker events (from the grid)
  events.on("press", (button: Cell<PickerCellType>) => {
    switch (button.type) {
      case "armor":
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
      case "perk":
        grid.fill([
          {
            id: "",
            type: "selection:perk",
            image: "./imgs/canvas/picker/perk/all.png",
          },
          ...Options.perk.map((it) => ({
            id: it.title,
            type: "selection:perk" as const,
            image: () => ImageIcon(it.image),
            loading: false,
          })),
        ]);
        break;
      case "selection:perk":
        // set the perk filter
        filters.perk = button.id;
        // refresh the button
        if (perkButton) {
          grid.updateButton(perkButton, {
            image: button.image,
          });
        }
        // update filters
        updateItems();
        break;
      case "selection:weapon":
        // set the weapon filter
        filters.weapon = button.id;
        // refresh the button
        grid.updateButton(button, {
          id: filters.weapon,
          image: button.image,
        });
        // update button filter
        if (weaponButton) {
          grid.updateButton(weaponButton, OpenWeaponButton);
        }
        // update the filter
        updateItems();
        break;
      case "selection:item":
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
