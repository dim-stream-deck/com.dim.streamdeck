import { z } from "zod";

export type PullItemAction = "equip" | "pull" | "vault";

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

export type PullItemSettings = {
  item?: string;
  icon?: string;
  inventory?: boolean;
  isExotic?: boolean;
  isSubClass?: boolean;
  label?: string;
  overlay?: string;
  subtitle?: string;
  element?: string;
};
