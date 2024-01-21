import { DIM, buildQuery } from "@/dim/api";
import { Cell, GridHelper } from "../helper/GridHelper";
import {
  Armor,
  Classes,
  Crafted,
  Elements,
  Rarity,
  WeaponButtons,
} from "./options";
import { ItemIcon } from "@/actions/pull-item/item-icon";
import { ev } from "@/util/ev";
import $, { Action } from "@elgato/streamdeck";
import { nextBy } from "@/util/cyclic";
import {
  PickerCellType,
  PickerFilterType,
  PickerSettings,
} from "@plugin/types";
import { State } from "@/state";

type OptionCell = {
  id?: string;
  title?: string;
  image: string;
};

const deleteFrom = (items: string[], item: string) => {
  const index = items.indexOf(item);
  if (index > -1) {
    items.splice(index, 1);
  }
};

export const onPickerActivate = (
  grid: GridHelper<PickerCellType>,
  device: string,
  profile: string,
  settings: PickerSettings,
  action: Action
) => {
  const events = grid.init();
  const buttons = grid.lastRow;

  const Options: Record<string, OptionCell[]> = {
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
    Options.weapon = Options.weapon.filter((it) => it.id && keys.has(it.id));
  }

  const filters: Record<string, string | undefined> = Object.fromEntries(
    settings.filters.map((it) => [it, settings.defaultOptions[it]])
  );

  settings.filters.forEach((filter, i) => {
    const id = filters[filter];
    grid.updateButton(buttons[i], {
      id,
      image:
        Options[filter]?.find((it) => it.id ?? it.title === id)?.image ??
        `./imgs/canvas/picker/${filter}/${id}.png`,
      type: filter,
    });
  });

  let next;
  const stack = [] as string[];

  const updateItems = () => {
    if (stack.includes("filters")) {
      return;
    }
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
  const filtersButton = buttons.find((it) => it.type === "filters");

  const fillFilters = () => {
    if (filtersButton) {
      grid.fill(
        settings.options.filters?.map((filter) => {
          const id = filters[filter] ?? "all";
          const option = Options[filter]?.find(
            (it) => (it.id ?? it.title) === id
          );
          return {
            id,
            image: option?.image ?? `./imgs/canvas/picker/${filter}/${id}.png`,
            type: filter as PickerFilterType,
          };
        })
      );
    }
  };

  const updateFiltersGrid = () => {
    stack.pop();
    if (!stack.length) {
      updateItems();
    } else {
      fillFilters();
    }
  };

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
        next = nextBy(button.id, "id", options, button.direction);
        // refresh the button
        grid.updateButton(button, next);
        // update the filter
        filters[button.type] = next.id;
        // update the grid
        updateItems();
        break;
      case "weapon":
        deleteFrom(stack, "perk");
        if (!stack.includes("weapon")) {
          grid.fill(Options.weapon);
          stack.push("weapon");
        }
        break;
      case "filters":
        if (stack.includes("filters")) {
          stack.length = 0;
          updateItems();
        } else {
          stack.push("filters");
          fillFilters();
        }
        if (filtersButton) {
          grid.updateButton(filtersButton, {
            image: `./imgs/canvas/picker/filters/all${stack.length > 0 ? "-off" : ""}.png`,
          });
        }
        break;
      case "perk":
        deleteFrom(stack, "weapon");
        if (!stack.includes("perk")) {
          stack.push("perk");
          grid.fill([
            {
              id: "",
              type: "selection:perk",
              image: "./imgs/canvas/picker/perk/all.png",
            },
            ...Options.perk.map((it) => ({
              id: it.title,
              type: "selection:perk" as const,
              image: it.image,
              loading: false,
            })),
          ]);
        }
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
        updateFiltersGrid();
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
          grid.updateButton(weaponButton, {
            image: button.image,
          });
        }
        // update filters
        updateFiltersGrid();
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
