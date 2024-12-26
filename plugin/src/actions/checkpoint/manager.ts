import { ev } from "@/util/ev";
import { WebSocket } from "ws";
import { CheckpointSettings, CheckpointGroup, Checkpoint } from "@plugin/types";

const cps = new Map<string, string>();

const activities: CheckpointGroup[] = [];

export const definitions = new Map<string, Checkpoint>();

const endpoint = process.env.CHECKPOINT_API!;

const client = new WebSocket(endpoint.replace("http", "ws"), {
  headers: {
    Authorization: process.env.CHECKPOINT_API_KEY,
  },
});

client.onmessage = (event) => {
  const data = JSON.parse(event.data.toString()) as Record<string, string>;
  Object.entries(data).forEach(([key, value]) =>
    cps.set(key, value.replace("$", "CheckpointBot#"))
  );
  ev.emit("checkpoints");
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

export const getActivitiesDefinitions = () =>
  [...activities.values()].map((activity) => ({
    ...activity,
  }));
