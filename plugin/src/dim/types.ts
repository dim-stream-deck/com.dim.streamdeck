export interface DimActions {
  refresh: () => void;

  toggleFarmingMode: () => void;

  selection: (params?: { type?: "item" | "loadout" }) => void;

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

  requestPickerItems: (params: {
    element: "all" | number;
    weapon: number;
    device: string;
    crafted?: boolean;
  }) => void;

  randomize: (params: { weaponsOnly: boolean }) => void;
}
