import { Equipment } from "./util/equipment";
import { ev } from "./main";
import { db, saveDB } from "./util/db";
import { MaxPower, MetricType, Postmaster, VaultType } from "@plugin/types";

// Character

export type Character = {
  class: number;
  icon: string;
  background: string;
};

export interface State {
  // pull item
  equippedItems: string[];
  // farming mode
  farmingMode?: boolean;
  // state
  character?: Character;
  maxPower?: MaxPower;
  metrics?: {
    artifactIcon: string;
  } & Partial<Record<MetricType, number>>;
  postmaster?: Postmaster;
  vault?: Record<VaultType, number>;
}

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
export const loadEquipment = () => {
  db.data.equippedItems?.forEach((item) => Equipment.add(item));
  ev.emit("equipmentStatus");
};

// Save the equipped items to the local db.
process.on("exit", () => db.write());
