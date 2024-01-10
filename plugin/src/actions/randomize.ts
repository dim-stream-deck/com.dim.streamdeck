import { DIM } from "@/dim/api";
import { KeyDown } from "@/settings";
import { action, SingletonAction } from "@elgato/streamdeck";
import { Schemas } from "@plugin/types";

/**
 * Randomize the current loadout
 */
@action({ UUID: "com.dim.streamdeck.randomize" })
export class Randomize extends SingletonAction {
  onKeyDown(e: KeyDown) {
    const { weaponsOnly } = Schemas.randomize(e.payload.settings);
    DIM.randomize({ weaponsOnly });
  }
}
