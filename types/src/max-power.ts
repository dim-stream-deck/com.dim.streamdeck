export type MaxPower = {
  artifact: number;
  base: string;
  total: string;
};

export type MaxPowerType = keyof MaxPower;

export type MaxPowerSettings = {
  powerType?: MaxPowerType | "all";
};
