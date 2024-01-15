import { sendToWeb } from "@/main";
import { DimActions } from "./types";
import { PickerCategory } from "@plugin/types";

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

  equipLoadout: (args) =>
    sendToWeb({
      action: "equipLoadout",
      ...args,
    }),

  equipMaxPower: () => sendToWeb({ action: "equipMaxPower" }),

  collectPostmaster: () => sendToWeb({ action: "collectPostmaster" }),

  pullItem: (args) => sendToWeb({ action: "pullItem", ...args }),

  search: (args) => sendToWeb({ action: "search", ...args }),

  randomize: (args) => sendToWeb({ action: "randomize", ...args }),

  requestPickerItems: (args) =>
    sendToWeb({ action: "requestPickerItems", ...args }),

  requestPerks: () => sendToWeb({ action: "requestPerks" }),
};

export const buildQuery = (
  filters: Record<string, string | undefined>,
  type: PickerCategory
) => {
  const stringified = Object.entries(filters)
    .filter(([, it]) => Boolean(it) && it !== "all")
    .map(([key, value]) =>
      key === "perk" ? `exactperk:"${value}"` : `is:${value}`
    )
    .join(" ");
  const prefix = type === "all" ? ["is:weapon", "is:armor"] : [`is:${type}`];
  return `(${prefix.join(" or ")}) ` + stringified;
};
