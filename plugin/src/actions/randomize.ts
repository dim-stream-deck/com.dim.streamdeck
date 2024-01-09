import { DIM } from "@/dim/api";
import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { RandomizeSettings } from "shared";

/**
 * Randomize the current loadout
 */
@action({ UUID: "com.dim.streamdeck.randomize" })
export class Randomize extends SingletonAction {
  onKeyDown(e: KeyDownEvent<RandomizeSettings>) {
    DIM.randomize({
      weaponsOnly: e.payload.settings?.weaponsOnly ?? true,
    });
  }
}
