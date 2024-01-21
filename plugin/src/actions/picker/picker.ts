import { KeyDown } from "@/settings";
import $, {
  action,
  PropertyInspectorDidAppearEvent,
  SingletonAction,
} from "@elgato/streamdeck";
import { registerPickerGrid } from "./helper/GridManager";
import { onPickerActivate } from "./util/manager";
import { Profiles } from "./util/options";
import { Schemas } from "@plugin/types";
import { DIM } from "@/dim/api";
import { ev } from "@/main";
import { State } from "@/state";
import { log } from "@/util/logger";

/**
 * Show a item picker
 */
@action({ UUID: "com.dim.streamdeck.picker" })
export class Picker extends SingletonAction {
  async onKeyDown(e: KeyDown) {
    const device = $.devices.getDeviceById(e.deviceId)!;
    const suffix = Profiles[device.type!];
    const size = device.size;
    if (suffix === undefined || !size) {
      return;
    }
    // register the picker grid for this device
    const grid = registerPickerGrid(
      e.deviceId,
      size.rows,
      size.columns,
      device.type === 7
    );
    // get the picker settings
    const settings = Schemas.picker(e.payload.settings);
    // start the picker
    onPickerActivate(grid, device.id, `DIM${suffix}`, settings, e.action);
    // log action
    log("picker");
  }

  onPropertyInspectorDidAppear(e: PropertyInspectorDidAppearEvent<{}>) {
    ev.once("perks", () => {
      e.action.sendToPropertyInspector({
        perks: State.get("perks"),
      });
    });
    DIM.requestPerks();
  }
}
