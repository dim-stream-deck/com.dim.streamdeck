import { action, SingletonAction } from "@elgato/streamdeck";
import { load } from "cheerio";

const loadCheckpoints = async () => {
  const body = await fetch(process.env.CHECKPOINT_URL);
  const text = await body.text();
  const $ = load(text);
  const items = $(".col .card").map((_, el) => {
    const $el = $(el);
    const [name, difficulty] = $el
      .find(".card-title")
      .text()
      .split(":")
      .map((s) => s.trim());
    return {
      name,
      difficulty: difficulty.toLowerCase(),
      step: $el.find(".card-subtitle").text(),
      copyId: $el.find(".card-text").text(),
    };
  });
};

/**
 * Allow to copy the insert line to the clipboard (of specific checkpoint)
 */
@action({ UUID: "com.dim.streamdeck.checkpoint" })
export class Checkpoint extends SingletonAction {
  async onKeyDown() {}
}
