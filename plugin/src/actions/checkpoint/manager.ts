import { load } from "cheerio";
import md5 from "md5";

let lastQuery: number;

interface Checkpoint {
  id: string;
  activity: string;
  image?: string;
  difficulty?: "normal" | "master";
  step: string;
  copyId: string;
}

const queryCheckpoints = async () => {
  if (lastQuery && Date.now() - lastQuery < 1000 * 60) {
    return;
  }
  const body = await fetch(process.env.CHECKPOINT_API!);
  const text = await body.text();
  const $ = load(text);
  CheckpointManager.items = Array.from(
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
  ).map((it) => ({
    ...it,
    id: md5(`${it.activity}:${it.difficulty || "normal"}:${it.step}`),
  }));
  console.log(CheckpointManager.items);
  lastQuery = Date.now();
};

export const CheckpointManager = {
  refresh: () => queryCheckpoints(),
  items: [] as Checkpoint[],
};
