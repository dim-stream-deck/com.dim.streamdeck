import { ev } from "@/util/ev";
import { CheckpointSettings, CheckpointGroup, Checkpoint } from "@plugin/types";
import axios from "axios";
import { z } from "zod";

const cps = new Map<string, string>();

const activities: CheckpointGroup[] = [];

export const definitions = new Map<string, Checkpoint>();

const endpoint = process.env.CHECKPOINT_API!;

const checkpointHost = process.env.CHECKPOINT_HOST!;

const BotsSchema = z
  .object({
    name: z.string(),
    activityHash: z.number(),
    encounter: z.number(),
    acquired: z.boolean(),
  })
  .array();

export const fetchBots = async () => {
  try {
    console.log("Fetching bots");
    const res = await axios.post(
      `https://${checkpointHost}/_actions/bots.getBotsFromDb`,
      {
        headers: {
          Host: "d2checkpoint.com",
          Origin: `https://${checkpointHost}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          Connection: "keep-alive",
        },
      }
    );

    const [indexes, ...data] = res.data;

    const bots = indexes.map((idx: number) => {
      const bot = data[idx - 1];
      const activityHash = data[bot.activityHash - 1];
      return {
        name: data[bot.name - 1],
        activityHash,
        encounter: data[bot.encounter - 1],
        acquired: activityHash !== 0,
      };
    });

    return BotsSchema.parse(bots);
  } catch (e) {
    console.error(" >> Failed to fetch bots", e);
    return Promise.resolve([]);
  }
};

export const loadActivities = async () => {
  try {
    const response = await fetch(`${endpoint}/definitions.json`, {
      headers: {
        Authorization: process.env.CHECKPOINT_API_KEY!,
      },
    });
    const data = (await response.json()) as CheckpointGroup[];
    activities.length = 0;
    activities.push(...data);
    activities.forEach((group) => {
      group.items.forEach((activity) => {
        Object.entries(activity.ids ?? {}).forEach(([_, id]) => {
          definitions.set(id, activity);
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
};

export const searchCheckpoint = (settings: CheckpointSettings) => {
  const { id, encounter } = settings;
  const key = `${id}:${encounter}`;
  return cps.get(key);
};

export const updateCheckpointsBots = async () => {
  const bots = await fetchBots();
  for (const bot of bots) {
    const key = `${bot.activityHash}:${bot.encounter}`;
    cps.set(key, bot.name);
  }
  ev.emit("checkpoints");
};

setInterval(updateCheckpointsBots, 1000 * 60 * 5);

export const getActivitiesDefinitions = () =>
  [...activities.values()].map((activity) => ({
    ...activity,
  }));
