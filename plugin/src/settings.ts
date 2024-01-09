import $ from "@elgato/streamdeck";
import { mergeDeepRight } from "ramda";
import { z } from "zod";

// Global Settings

export type PullItemAction = "equip" | "pull" | "vault";

export type NoSettings = {};

const GlobalSettingsSchema = z.object({
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

export type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;

export const setGlobalSettings = async (update: Partial<GlobalSettings>) => {
  const baseSettings = await $.settings.getGlobalSettings();
  // get the current global settings
  const settings = GlobalSettingsSchema.parse(baseSettings);
  // merge old settings with the new ones
  return $.settings.setGlobalSettings(mergeDeepRight(settings, update));
};
