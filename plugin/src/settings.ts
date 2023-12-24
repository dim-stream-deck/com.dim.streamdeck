// Metrics

export const MetricTypes = [
  "battlePass",
  "crucible",
  "gambit",
  "gunsmith",
  "ironBanner",
  "trials",
  "triumphs",
  "triumphsActive",
  "vanguard",
] as const;

export type MetricType = (typeof MetricTypes)[number];

type Metrics = {
  artifactIcon: string;
} & Partial<Record<MetricType, number>>;

// Max Power
export interface MaxPower {
  artifact: number;
  base: string;
  total: string;
}

export type MaxPowerType = keyof MaxPower;

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
  enhancedPrisms: number;
  spoils: number;
  total: number;
}

// Global Settings

export interface GlobalSettings {
  equipmentGrayscale?: boolean;
  farmingMode?: boolean;
  authentication?: Record<string, string>;
  equippedItems: string[];
  enabledSoloService?: boolean;
  maxPower?: MaxPower;
  metrics?: Metrics;
  postmaster?: Postmaster;
  vault?: Vault;
}

export type NoSettings = {};
