import { load } from "cheerio";
import { CheckpointSettings } from "./checkpoint";

interface Checkpoint {
  activity: string;
  image?: string;
  difficulty?: "normal" | "master";
  step: string;
  copyId: string;
}

let lastQuery: number;
let items: Checkpoint[] = [];

const queryCheckpoints = async () => {
  if (lastQuery && Date.now() - lastQuery < 1000 * 60) {
    return;
  }
  const body = await fetch(process.env.CHECKPOINT_API!);
  const text = await body.text();
  const $ = load(text);
  items = Array.from(
    $(".col .card").map((_, el) => {
      const $el = $(el);
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
};

export const CheckpointManager = {
  refresh: () => queryCheckpoints(),
  search: (settings: CheckpointSettings) =>
    items.find(
      (it) =>
        it.step === settings.step &&
        (!it.difficulty || it.difficulty === settings.difficulty)
    ),
};
