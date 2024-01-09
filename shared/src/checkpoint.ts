import exp from "constants";
import { z } from "zod";

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
    difficulties: z.string().array(),
  })
  .array();

export type Checkpoint = z.infer<typeof CheckpointsSchema>[number];

export type CheckpointSettings = {
  activity?: string;
  step?: string;
  image?: string;
  difficulty?: "normal" | "master";
};

export type CheckpointDifficulty = CheckpointSettings["difficulty"];
