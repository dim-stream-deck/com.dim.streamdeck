import { sendToWeb } from "@/main";
import { DimActions } from "./types";

let latestSelection = Date.now();

export const DIM: DimActions = {
  selection: ({ type } = {}) => {
    // This is a hack to prevent the selection reset from being sent to client after an item/loadout selection
    if (!type && Date.now() - latestSelection < 1000) return;
    latestSelection = Date.now();
    return sendToWeb({ action: "selection", type });
  },

  refresh: () => sendToWeb({ action: "refresh" }),

  toggleFarmingMode: () => sendToWeb({ action: "toggleFarmingMode" }),

  equipLoadout: ({ loadoutId, characterId }) =>
    sendToWeb({
      action: "equipLoadout",
      loadoutId,
      characterId,
    }),

  equipMaxPower: () => sendToWeb({ action: "equipMaxPower" }),

  collectPostmaster: () => sendToWeb({ action: "collectPostmaster" }),

  pullItem: ({ itemId, equip }) =>
    sendToWeb({ action: "pullItem", itemId, equip }),

  search: ({ query, page, pullItems }) =>
    sendToWeb({ action: "search", query, page, pullItems }),

  randomize: ({ weaponsOnly }) =>
    sendToWeb({ action: "randomize", weaponsOnly }),
};
