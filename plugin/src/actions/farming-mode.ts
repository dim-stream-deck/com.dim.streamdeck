import { DIM } from "@/dim/api";
import { ev } from "@/util/ev";
import { WillAppear } from "@/settings";
import { State } from "@/state";
import { log } from "@/util/logger";
import { Action, action, SingletonAction } from "@elgato/streamdeck";

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

  onWillAppear(e: WillAppear) {
    this.update(e.action);
    this.listener = () => this.update(e.action);
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
