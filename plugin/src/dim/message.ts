import { z } from "zod";
import { BrowserLoadoutsSchema } from "@plugin/types";

export const DimMessageSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("loadouts"), data: BrowserLoadoutsSchema }),
  z.object({
    action: z.literal("farmingMode"),
    data: z.boolean(),
  }),
  z.object({
    action: z.literal("state"),
    data: z.record(z.string(), z.any()),
  }),
  z.object({
    action: z.literal("pickerItems"),
    data: z.object({
      device: z.string(),
      items: z.record(z.string(), z.any()).array(),
    }),
  }),
  z.object({
    action: z.literal("perks"),
    data: z
      .object({
        title: z.string(),
        image: z.string(),
      })
      .array(),
  }),
]);

export type DimMessage = z.infer<typeof DimMessageSchema>;
