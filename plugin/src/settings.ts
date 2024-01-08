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
  enhancementPrisms: number;
  spoils: number;
  total: number;
}

// Global Settings

export type PullItemAction = "equip" | "pull" | "vault";

export interface GlobalSettings {
  // pull item
  equipmentGrayscale?: boolean;
  pullItemSinglePress?: PullItemAction;
  pullItemDoublePress?: PullItemAction;
  pullItemHoldPress?: PullItemAction;
  pullItemSingleToggle?: boolean;
  equippedItems: string[];
  // checkpoint
  checkpointJoinPrefix?: string;
  checkpointPaste?: boolean;
  // farming mode
  farmingMode?: boolean;
  // solo mode
  enabledSoloService?: boolean;
  // state
  maxPower?: MaxPower;
  metrics?: Metrics;
  postmaster?: Postmaster;
  vault?: Vault;
  // authentication
  authentication?: Record<string, string>;
}

export type NoSettings = {};
