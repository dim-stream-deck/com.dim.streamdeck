export interface DimActions {
  refresh: () => void;

  toggleFarmingMode: () => void;

  selection: (params: { active: boolean; type?: "item" | "loadout" }) => void;

  equipLoadout: (params: {
    loadoutId: string;
    characterId: string | "vault";
  }) => void;

  equipMaxPower: () => void;

  collectPostmaster: () => void;

  pullItem: (params: { itemId: string; equip: boolean }) => void;

  search: (params: { query: string; page: string; pullItems: boolean }) => void;

  randomize: (params: { weaponsOnly: boolean }) => void;
}
