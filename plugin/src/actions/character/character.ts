import { Cache } from "@/util/cache";
import { Watcher } from "@/util/watcher";
import {
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { CharacterIcon } from "./character-icon";
import { State } from "@/state";
import { NoSettings } from "shared";

/**
 * Show character character
 */
@action({ UUID: "com.dim.streamdeck.character" })
export class Character extends SingletonAction {
  private watcher = Watcher("state");

  async onWillAppear(e: WillAppearEvent<NoSettings>) {
    this.watcher.start(e.action.id, async () => {
      const character = State.get("character");
      if (!character) return;
      const image = await Cache.canvas(
        `${character.class}-${character.icon}`,
        () => (character ? CharacterIcon(character) : undefined)
      );
      e.action.setImage(image);
    });
  }

  onWillDisappear(e: WillDisappearEvent<NoSettings>) {
    this.watcher.stop(e.action.id);
  }
}
