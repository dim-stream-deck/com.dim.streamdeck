import { Equipment } from "./util/equipment";
import { ev } from "./main";
import { db, saveDB } from "./util/db";
import { MaxPower, MetricType } from "shared";

type Metrics = {
  artifactIcon: string;
} & Partial<Record<MetricType, number>>;

// Character

export interface Character {
  class: number;
  icon: string;
  background: string;
}

// Vault

export const VaultTypes = ["shards", "brightDust", "glimmer", "vault"] as const;

export type VaultType = (typeof VaultTypes)[number] | "dust";

type Vault = {
  /**
   * @deprecated
   * @see brightDust
   */
  dust?: number;
} & Partial<Record<VaultType, number>>;

// Postmaster

export interface Postmaster {
  ascendantShards: number;
  enhancementPrisms: number;
  spoils: number;
  total: number;
}

export interface State {
  // pull item
  equippedItems: string[];
  // farming mode
  farmingMode?: boolean;
  // state
  character?: Character;
  maxPower?: MaxPower;
  metrics?: Metrics;
  postmaster?: Postmaster;
  vault?: Vault;
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
