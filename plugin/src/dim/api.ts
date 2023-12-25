import { sendToWeb } from "@/main";
import { DimActions } from "./types";

export const DIM: DimActions = {
  selection: ({ type } = {}) => sendToWeb({ action: "selection", type }),

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
