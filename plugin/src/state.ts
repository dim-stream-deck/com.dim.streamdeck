import { ev } from "./main";
import { db, saveDB } from "./util/db";
import { Metric, VaultType } from "@plugin/types";

export const Equipment = new Set<string>();

// Character

export type Character = {
  class: number;
  icon: string;
  background: string;
};

// State

type Postmaster = {
  ascendantShards: number;
  enhancementPrisms: number;
  spoils: number;
  total: number;
};

type MaxPower = {
  artifact: number;
  base: string;
  total: string;
};

export type State = {
  equippedItems: string[];
  farmingMode?: boolean;
  character?: Character;
  maxPower?: MaxPower;
  postmaster?: Postmaster;
  vault?: Record<VaultType, number>;
  metrics?: Record<Metric, number> & {
    artifactIcon: string;
  };
};

// State manager
export const State = {
  get: <TKey extends keyof State>(key: TKey): State[TKey] => {
    return db.data[key];
  },
  set: (data: Partial<State>) => {
    db.data = {
      ...db.data,
      ...data,
    };
    if (data.character) {
      saveDB();
    }
  },
};

/**
 * Load the equipped items from the local db.
 */
export const reloadEquipment = () => {
  Equipment.clear();
  db.data.equippedItems?.forEach((item) => Equipment.add(item));
  ev.emit("equipmentStatus");
};

// Save the equipped items to the local db.
process.on("exit", () => db.write());
