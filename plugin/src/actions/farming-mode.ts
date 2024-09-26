import { DIM } from "@/dim/api";
import { ev } from "@/util/ev";
import { State } from "@/state";
import { log } from "@/util/logger";
import {
	action,
	KeyUpEvent,
	SingletonAction,
	WillAppearEvent,
} from "@elgato/streamdeck";

type Action = KeyUpEvent["action"];

/**
 * Toggle the farming mode on DIM.
 */
@action({ UUID: "com.dim.streamdeck.farming-mode" })
export class FarmingMode extends SingletonAction {
  private listener: any;

  private update(e: Action) {
    const farmingMode = State.get("farmingMode");
    e.setState(farmingMode ? 1 : 0);
  }

  onWillAppear(e: WillAppearEvent) {
    this.update(e.action as Action);
    this.listener = () => this.update(e.action as Action);
    ev.on("farmingMode", this.listener);
  }

  onWillDisappear() {
    ev.off("farmingMode", this.listener);
  }

  onKeyUp() {
    DIM.toggleFarmingMode();
    // log action
    log("farming-mode");
  }
}
