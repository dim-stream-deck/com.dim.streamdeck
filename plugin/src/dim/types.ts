export interface DimActions {
  refresh: () => void;

  toggleFarmingMode: () => void;

  selection: (params?: {
    type?: "item" | "inventory-item" | "loadout";
  }) => void;

  equipLoadout: (params: {
    loadout: string;
    character: string | "vault";
  }) => void;

  equipMaxPower: () => void;

  collectPostmaster: () => void;

  pullItem: (params: {
    itemId: string;
    type: "equip" | "pull" | "vault";
  }) => void;

  search: (params: {
    query: string;
    page: string;
    pullItems: boolean;
    sendToVault: boolean;
  }) => void;

  requestPickerItems: (params: { query: string; device: string }) => void;

  requestPerks: () => void;

  randomize: (params: { weaponsOnly: boolean }) => void;
}
