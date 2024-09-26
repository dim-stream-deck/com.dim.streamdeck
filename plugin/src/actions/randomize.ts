import { DIM } from "@/dim/api";
import { log } from "@/util/logger";
import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { Schemas } from "@plugin/types";

/**
 * Randomize the current loadout
 */
@action({ UUID: "com.dim.streamdeck.randomize" })
export class Randomize extends SingletonAction {
  onKeyDown(e: KeyDownEvent) {
    const { weaponsOnly } = Schemas.randomize(e.payload.settings);
    DIM.randomize({ weaponsOnly });
    // log action
    log("randomize");
  }
}
