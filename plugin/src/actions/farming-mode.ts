import { DIM } from "@/dim/api";
import { ev } from "@/main";
import { GlobalSettings, NoSettings } from "@/settings";
import $, {
  action,
  KeyUpEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";

/**
 * Toggle the farming mode on DIM.
 */
@action({ UUID: "com.dim.streamdeck.farming-mode" })
export class FarmingMode extends SingletonAction {
  private listener: any;

  async onWillAppear(e: WillAppearEvent<NoSettings>) {
    const settings = await $.settings.getGlobalSettings<GlobalSettings>();
    e.action.setState(settings.farmingMode ? 1 : 0);
    this.listener = (state: boolean) => e.action.setState(state ? 1 : 0);
    ev.on("farmingMode", this.listener);
  }

  onWillDisappear() {
    ev.off("farmingMode", this.listener);
  }

  onKeyUp(e: KeyUpEvent<NoSettings>) {
    e.action.setState(e.payload.state ? 1 : 0);
    DIM.toggleFarmingMode();
  }
}
