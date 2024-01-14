import { z } from "zod";

// Global Settings

export const GlobalSettingsSchema = z.object({
  equipmentGrayscale: z.boolean().optional(),
  pullItemSinglePress: z.enum(["equip", "pull", "vault"]).default("equip"),
  pullItemDoublePress: z.enum(["equip", "pull", "vault"]).default("pull"),
  pullItemHoldPress: z.enum(["equip", "pull", "vault"]).default("vault"),
  pullItemSingleToggle: z.boolean().default(true),
  checkpointJoinPrefix: z.string().optional(),
  checkpointPaste: z.boolean().default(true),
  enabledSoloService: z.boolean().optional(),
  authentication: z.record(z.string()).default({}),
});

// Actions

// App

export const AppTypeSchema = z.enum([
  "app-browser",
  "beta-browser",
  "app-chrome",
  "beta-chrome",
  "app-windows",
]);

export const AppSettingsSchema = z.object({
  type: AppTypeSchema.default("app-browser"),
});

// Metrics

export const MetricSchema = z.enum([
  "battlePass",
  "crucible",
  "gambit",
  "gunsmith",
  "ironBanner",
  "trials",
  "triumphs",
  "triumphsActive",
  "vanguard",
]);

export const MetricsSettingsSchema = z.object({
  metric: MetricSchema.default("battlePass"),
  disabled: z.array(MetricSchema).default([]),
  order: z.array(MetricSchema).default(MetricSchema.options),
  pinned: z.boolean().default(false),
});

// Search

export const SearchBehaviorSchema = z.enum(["search", "pull", "send-to-vault"]);

export const SearchSettingsSchema = z.object({
  query: z.string().default(""),
  page: z.string().default("inventory"),
  behavior: SearchBehaviorSchema.default("search"),
});

// Randomize

export const RandomizeSettingsSchema = z.object({
  weaponsOnly: z.boolean().default(true),
});

// Max Power

export const MaxPowerTypeSchema = z.enum(["artifact", "base", "total"]);

export const MaxPowerSettingsSchema = z.object({
  type: MaxPowerTypeSchema.default("total"),
});

// Checkpoint

export const CheckpointDifficultySchema = z.enum(["normal", "master"]);

export const CheckpointsSchema = z
  .object({
    activity: z.string(),
    group: z.string(),
    steps: z
      .object({
        title: z.string(),
        image: z.string(),
      })
      .array(),
    difficulties: CheckpointDifficultySchema.array().default([]),
  })
  .array();

export const CheckpointSettingsSchema = z.object({
  activity: z.string().optional(),
  step: z.string().optional(),
  image: z.string().optional(),
  difficulty: CheckpointDifficultySchema.nullish(),
});

// Vault

export const VaultTypeSchema = z.enum([
  "shards",
  "brightDust",
  "glimmer",
  "vault",
]);

export const VaultSettingsSchema = z.object({
  type: VaultTypeSchema.default("vault"),
});

// Pull Item

export const PullItemActionSchema = z.enum(["equip", "pull", "vault"]);

export const PullItemSettingsSchema = z.object({
  item: z.string().nullish(),
  icon: z.string().nullish(),
  isExotic: z.boolean().nullish(),
  isSubClass: z.boolean().nullish(),
  label: z.string().nullish(),
  overlay: z.string().nullish(),
  subtitle: z.string().nullish(),
  element: z.string().nullish(),
});

// Postmaster

export const PostmasterTypeSchema = z.enum([
  "total",
  "enhancementPrisms",
  "ascendantShards",
  "spoils",
]);

export const CounterStyleSchema = z.enum(["percentage", "counter"]);

export const PostmasterSettingsSchema = z.object({
  type: PostmasterTypeSchema.default("total"),
  collectPostmaster: z.boolean().default(false),
  style: CounterStyleSchema.default("counter"),
});

// Loadout

export const LoadoutSettingsSchema = z.object({
  loadout: z.string().nullish(),
  label: z.string().nullish(),
  subtitle: z.string().nullish(),
  icon: z.string().nullish(),
  character: z.string().nullish(),
  inGameIcon: z
    .object({
      background: z.string(),
      icon: z.string(),
    })
    .nullish(),
});

// Picker

export const PickerFilterSchema = z.enum([
  "element",
  "crafted",
  "weapon",
  "armor",
  "class",
  "perk",
  "rarity",
  "filters",
]);

export const PickerSettingsSchema = z.object({
  filters: PickerFilterSchema.array().default([]),
  defaultOptions: z
    .record(PickerFilterSchema, z.string().default("all"))
    .default({}),
  options: z
    .object({
      weapon: z.string().array().optional(),
      filters: z.string().array().optional(),
      perk: z.string().array().optional(),
    })
    .default({}),
});

export const Schemas = {
  global: (data: unknown) => GlobalSettingsSchema.parse(data),
  app: (data: unknown) => AppSettingsSchema.parse(data),
  metrics: (data: unknown) => MetricsSettingsSchema.parse(data),
  search: (data: unknown) => SearchSettingsSchema.parse(data),
  randomize: (data: unknown) => RandomizeSettingsSchema.parse(data),
  maxPower: (data: unknown) => MaxPowerSettingsSchema.parse(data),
  checkpoint: (data: unknown) => CheckpointSettingsSchema.parse(data),
  vault: (data: unknown) => VaultSettingsSchema.parse(data),
  picker: (data: unknown) => PickerSettingsSchema.parse(data),
  pullItem: (data: unknown) => PullItemSettingsSchema.parse(data),
  postmaster: (data: unknown) => PostmasterSettingsSchema.parse(data),
  loadout: (data: unknown) => LoadoutSettingsSchema.parse(data),
};
