import { DIM } from "@/dim/api";
import { KeyDown } from "@/settings";
import { log } from "@/util/logger";
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
    // log action
    log("randomize");
  }
}
