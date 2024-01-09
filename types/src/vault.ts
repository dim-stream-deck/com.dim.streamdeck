export const VaultTypes = ["shards", "brightDust", "glimmer", "vault"] as const;

export type VaultType = (typeof VaultTypes)[number];

export type VaultSettings = {
  item?: VaultType;
};
