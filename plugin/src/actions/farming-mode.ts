import { DIM } from "@/dim/api";
import { ev } from "@/main";
import { State } from "@/state";
import {
  Action,
  action,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { NoSettings } from "shared";

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

  async onWillAppear(e: WillAppearEvent<NoSettings>) {
    this.update(e.action);
    this.listener = () => this.update(e.action);
    ev.on("farmingMode", this.listener);
  }

  onWillDisappear() {
    ev.off("farmingMode", this.listener);
  }

  onKeyUp() {
    DIM.toggleFarmingMode();
  }
}
