import { z } from "zod";

export type NoSettings = {};

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

export type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;

export * from "./src/metrics";
export * from "./src/postmaster";
export * from "./src/max-power";
export * from "./src/randomize";
export * from "./src/search";
export * from "./src/app";
export * from "./src/checkpoint";
export * from "./src/pull-item";
