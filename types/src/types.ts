import { z } from "zod";
import {
  AppSettingsSchema,
  CheckpointSettingsSchema,
  CheckpointsSchema,
  GlobalSettingsSchema,
  LoadoutSettingsSchema,
  MaxPowerSettingsSchema,
  MetricsSettingsSchema,
  PickerFilterSchema,
  PickerSettingsSchema,
  PostmasterSettingsSchema,
  PullItemSettingsSchema,
  RandomizeSettingsSchema,
  SearchSettingsSchema,
  VaultSettingsSchema,
} from "./schemas";

// Global Settings

export type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;

// App

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export type AppType = AppSettings["type"];

// Metrics

export type MetricsSettings = z.infer<typeof MetricsSettingsSchema>;

export type Metric = MetricsSettings["metric"];

// Search

export type SearchSettings = z.infer<typeof SearchSettingsSchema>;

export type SearchBehavior = SearchSettings["behavior"];

// Randomize

export type RandomizeSettings = z.infer<typeof RandomizeSettingsSchema>;

// Max Power

export type MaxPowerSettings = z.infer<typeof MaxPowerSettingsSchema>;

export type MaxPowerType = MaxPowerSettings["type"];

// Checkpoint

export type Checkpoint = z.infer<typeof CheckpointsSchema>[number];

export type CheckpointSettings = z.infer<typeof CheckpointSettingsSchema>;

// Vault

export type VaultSettings = z.infer<typeof VaultSettingsSchema>;

export type VaultType = VaultSettings["type"];

// Pull Item

export type PullItemSettings = z.infer<typeof PullItemSettingsSchema>;

// Postmaster

export type PostmasterSettings = z.infer<typeof PostmasterSettingsSchema>;
export type PostmasterType = PostmasterSettings["type"];
export type PostmasterStyle = PostmasterSettings["style"];

// Loadout

export type LoadoutSettings = z.infer<typeof LoadoutSettingsSchema>;

// Picker

export type PickerFilterType = z.infer<typeof PickerFilterSchema>;

export type PickerCellType =
  | PickerFilterType
  | "selection:weapon"
  | "selection:item"
  | "selection:perk";

export type PickerSettings = z.infer<typeof PickerSettingsSchema>;

export type PickerCategory = PickerSettings["category"];
