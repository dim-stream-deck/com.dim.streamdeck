import { z } from "zod";

export const DimMessageSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("farmingMode"),
    data: z.boolean(),
  }),
  z.object({
    action: z.literal("state"),
    data: z.record(z.any()),
  }),
  z.object({
    action: z.literal("pickerItems"),
    data: z.object({
      device: z.string(),
      items: z.record(z.any()).array(),
    }),
  }),
]);

export type DimMessage = z.infer<typeof DimMessageSchema>;
