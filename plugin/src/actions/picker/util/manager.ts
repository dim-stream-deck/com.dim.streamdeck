import { DIM, buildQuery } from "@/dim/api";
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
import { Action, KeyDownEvent } from "@elgato/streamdeck";
import { PickerFilterType, PickerSettings } from "@plugin/types";
import { State } from "@/state";
import { Loaders } from "@/util/images";
import { ImageIcon } from "./ImageIcon";
import { Cycler } from "@/lib/cycle";
import { Cell, GridHelper } from "@/lib/grid";
import { KeyDown } from "node_modules/@elgato/streamdeck/types/api";

type OptionCell = {
  id?: string;
  title?: string;
  image: string;
};

const useDisclosure = ({
  onOpen,
  onClose,
}: {
  onOpen: () => void;
  onClose: () => void;
}) => {
  const stack = new Set<string>();
  let open: string | undefined;
  return {
    get opened() {
      return open;
    },
    get stacked() {
      return stack.size > 1;
    },
    close(type = "panel") {
      open = undefined;
      stack.delete(type);
      onClose();
    },
    open(type = "panel") {
      open = type;
      stack.add(type);
      onOpen();
    },
  };
};

export const onPickerActivate = (
  grid: GridHelper,
  device: string,
  settings: PickerSettings,
  action: KeyDownEvent["action"]
) => {
  // init the grid
  grid.init();

  const panelHooks = {
    onClose: () => updateItems(),
    onOpen: () => grid.lock.remove("last-row"),
  };

  const panel = useDisclosure(panelHooks);

  const Options: Record<string, OptionCell[]> = {
    element: Elements,
    weapon: WeaponButtons,
    crafted: Crafted,
    armor: Armor,
    rarity: Rarity,
    class: Classes,
    perk: State.get("perks") ?? [],
  };

  // cleanup weapon keys
  if (settings.options.weapon) {
    const keys = new Set(
      settings.options.weapon.map((it) => it.replace("-", ""))
    );
    Options.weapon = Options.weapon.filter((it) => it.id && keys.has(it.id));
  }

  // init filters
  const filters: Record<string, string | undefined> = Object.fromEntries(
    settings.filters.map((it) => [it, settings.defaultOptions[it]])
  );

  const updateNavigation = () => {
    if (grid.hasTouchBar) {
      return grid.update("bottom-right", {
        type: "navigation",
        layout: "picker-layout-full.json",
        image: "./imgs/canvas/picker/navigation.png",
        locked: true,
        onPress: !panel.opened ? () => grid.destroy() : () => panel.close(),
        onDialLeft: () => grid.pagination.previous(),
        onDialRight: () => grid.pagination.next(),
      });
    }
    if (panel.opened !== "panel") {
      grid.update("bottom-left", {
        type: "navigation",
        image: "./imgs/canvas/picker/close.png",
        locked: true,
        onPress: !panel.opened ? () => grid.destroy() : () => panel.close(),
      });
    } else if (grid.pagination.required) {
      grid.update("bottom-left", {
        type: "navigation",
        image: "./imgs/canvas/picker/prev.png",
        locked: true,
        onPress: () => grid.pagination.previous(),
      });
    }
    if (grid.pagination.required) {
      grid.update("bottom-right", {
        type: "navigation",
        image: "./imgs/canvas/picker/next.png",
        locked: true,
        onPress: () => grid.pagination.next(),
      });
    } else {
      grid.reset("bottom-right");
    }
  };

  const updateFiltersButtons = () => {
    if (!panel.opened) {
      // lock the last row
      const buttons = grid.lock.add("last-row", {
        start: Number(!grid.hasTouchBar),
      });

      // fill filters buttons
      settings.filters.forEach((filter, i) => {
        const button = buttons[i];
        const id = filters[filter];
        const image =
          filter === "perk" && id !== "all"
            ? ImageIcon(Options.perk.find((it) => it.title === id)?.image!)
            : `./imgs/canvas/picker/${filter}/${id}.png`;

        grid.update(button, {
          id,
          image,
          title: "",
          type: filter,
        });
      });
    }
  };

  const updateItems = () => {
    if (panel.opened) {
      return;
    }
    // request items from DIM
    DIM.requestPickerItems({
      device,
      query: buildQuery(filters, settings.category),
    });
  };

  grid.onPreRender(() => {
    updateNavigation();
    updateFiltersButtons();
  });

  // watch for picker items
  const pickerItemsListener = async (items: Record<string, any>[]) => {
    grid.fill(
      await Promise.all(
        items.map(async (item: any) => ({
          type: "selection:item",
          id: item.item,
          image: () => ItemIcon(item),
          loader: item.isExotic ? Loaders.exotic : Loaders.legendary,
        }))
      )
    );
  };

  // activate the picker event after the grid is ready
  grid.once("ready", () => {
    const key = `pickerItems:${device}`;
    // listen for picker items (from DIM)
    ev.on(key, pickerItemsListener);
    grid.once("close", () => ev.removeListener(key, pickerItemsListener));
    updateItems();
  });

  // listen for picker events (from the grid)
  grid.on("press", async (button: Cell & { clockwise?: boolean }) => {
    switch (button.type) {
      case "armor":
      case "element":
      case "class":
      case "rarity":
      case "crafted":
        // pick the options
        const options = Options[button.type];
        // cycle through elements
        const cycler = new Cycler(options, (it) => it.id);
        const next = cycler[button.clockwise === false ? "before" : "after"](
          button.id
        );
        // update the filter
        filters[button.type] = next.id;
        // refresh the button
        grid.update(button, next);
        // update the grid
        updateItems();
        break;
      case "weapon":
        panel.open();
        grid.fill(Options.weapon);
        break;
      case "filters":
        panel.open("filters");
        grid.fill(
          settings.options.filters?.map((filter) => {
            const id = filters[filter] ?? "all";
            const option = Options[filter]?.find(
              (it) => (it.id ?? it.title) === id
            );
            return {
              id,
              image:
                option?.image ?? `./imgs/canvas/picker/${filter}/${id}.png`,
              type: filter as PickerFilterType,
            };
          })
        );
        break;
      case "perk":
        panel.open();
        grid.fill([
          {
            id: "all",
            type: "selection:perk",
            image: "./imgs/canvas/picker/perk/all.png",
          },
          ...Options.perk.map((it) => ({
            id: it.title,
            type: "selection:perk",
            image: () => ImageIcon(it.image),
          })),
        ]);
        break;
      case "selection:perk":
        filters.perk = button.id;
        panel.close();
        break;
      case "selection:weapon":
        filters.weapon = button.id;
        panel.close();
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

  grid.open();
};
