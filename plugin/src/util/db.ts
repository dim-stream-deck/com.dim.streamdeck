import { type State } from "@/state";
import { JSONFileSyncPreset } from "lowdb/node";
import ms from "ms";

let latestSave = 0;

// load db
export const db = JSONFileSyncPreset<State>("state.json", {
  equippedItems: [],
});

export const saveDB = () => {
  const now = Date.now();
  if (now - latestSave > ms("5m")) {
    db.write();
    latestSave = now;
  }
};
