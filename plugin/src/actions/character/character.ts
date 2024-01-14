import { Watcher } from "@/util/watcher";
import { Action, action, SingletonAction } from "@elgato/streamdeck";
import { CharacterIcon } from "./character-icon";
import { State } from "@/state";
import { WillAppear, WillDisappear } from "@/settings";

/**
 * Show character character
 */
@action({ UUID: "com.dim.streamdeck.character" })
export class Character extends SingletonAction {
  private watcher = Watcher("state");

  private async update(e: Action) {
    const character = State.get("character");
    if (!character) return;
    e.setImage(await CharacterIcon(character));
  }

  onWillAppear(e: WillAppear) {
    this.watcher.start(e.action.id, () => this.update(e.action));
  }

  onWillDisappear(e: WillDisappear) {
    this.watcher.stop(e.action.id);
  }
}
