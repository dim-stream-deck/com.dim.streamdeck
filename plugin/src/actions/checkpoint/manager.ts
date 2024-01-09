import { load } from "cheerio";
import { ev } from "@/main";
import $ from "@elgato/streamdeck";
import ms from "ms";
import { CheckpointSettings } from "shared";

interface Checkpoint {
  activity: string;
  image?: string;
  difficulty?: "normal" | "master";
  step: string;
  copyId: string;
}

let lastQuery: number;
let items: Checkpoint[] = [];

/**
 * Query the checkpoints endpoint and update the list
 * @returns the checkpoints list
 */
const queryCheckpoints = async () => {
  // update only if the last query was more than 2 minutes ago
  if (lastQuery && Date.now() - lastQuery < ms("2m")) {
    return;
  }
  const body = await fetch(process.env.CHECKPOINT_API!);
  const text = await body.text();
  const dom = load(text);
  items = Array.from(
    dom(".col .card").map((_, el) => {
      const $el = dom(el);
      const [activity, difficulty] = $el
        .find(".card-title")
        .text()
        .split(":")
        .map((s) => s.trim());
      return {
        activity,
        image: $el.find("img").attr("src"),
        difficulty: difficulty?.toLowerCase()?.trim() as "normal" | "master",
        step: $el.find(".card-subtitle").text().trim(),
        copyId: $el.find(".card-text").text().trim(),
      };
    })
  );
  lastQuery = Date.now();
  // log the number of checkpoints loaded
  $.logger.info(`Loaded ${items.length} checkpoints`);
  //   // emit the checkpoints to the event emitter
  ev.emit("checkpoints");
};

export const CheckpointManager = {
  // This is the function that is called when a button is pressed or is loaded
  refresh: () => queryCheckpoints(),
  search: (settings: CheckpointSettings) =>
    items.find(
      (it) =>
        it.step === settings.step &&
        (!it.difficulty || it.difficulty === settings.difficulty)
    ),
};
