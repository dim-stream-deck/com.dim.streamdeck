import { Watcher } from "@/util/watcher";
import {
  action,
  KeyAction,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { CharacterIcon } from "./character-icon";
import { State } from "@/state";

/**
 * Show character character
 */
@action({ UUID: "com.dim.streamdeck.character" })
export class Character extends SingletonAction {
  private watcher = Watcher("state");

  private async update(e: KeyAction) {
    const character = State.get("character");
    if (!character) return;
    e.setImage(await CharacterIcon(character));
  }

  onWillAppear(e: WillAppearEvent) {
    if (e.action.isKey()) {
      this.update(e.action);
      this.watcher.start(e.action.id, () => this.update(e.action as KeyAction));
    }
  }

  onWillDisappear(e: WillDisappearEvent) {
    this.watcher.stop(e.action.id);
  }
}
