import $, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { Profiles } from "./util/options";
import { Schemas } from "@plugin/types";
import { DIM } from "@/dim/api";
import { log } from "@/util/logger";
import ms from "ms";
import { ev } from "@/util/ev";
import { onPickerActivate } from "./util/manager";
import { setupProfileGrid } from "@/lib/grid";

let latestRequest = 0;

const requestPerks = () => {
  const now = Date.now();
  if (now - latestRequest > ms("1m")) {
    return new Promise((resolve) => {
      latestRequest = now;
      ev.once("perks", resolve);
      DIM.requestPerks();
    });
  }
};

/**
 * Show a item picker
 */
@action({ UUID: "com.dim.streamdeck.picker" })
export class Picker extends SingletonAction {
  async onKeyDown(e: KeyDownEvent) {
    const device = e.action.device;
    const suffix = Profiles[device.type];
    const size = device.size;
    if (suffix === undefined || !size) {
      return;
    }

    /*
    const navigation = Navigation({
      cyclic: true,
      close: {
        position: "bottom-left",
        image: "./imgs/canvas/picker/close.png",
      },
      next: {
        position: "bottom-right",
        image: "./imgs/canvas/picker/next.png",
        disabledImage: "./imgs/canvas/picker/next-off.png",
      },
    });*/

    // register the picker grid for this device

    const grid = setupProfileGrid({
      streamDeck: $,
      device: e.action.device.id,
      size,
      profile: `DIM${suffix}`,
      encoders: {
        enabled: device.type === 7,
        layout: "picker-layout.json",
      },
    });

    // grid.lock.add("last-row");

    // get the picker settings
    const settings = Schemas.picker(e.payload.settings);
    // request perks
    await requestPerks();
    // start the picker
    onPickerActivate(grid, device.id, settings, e.action);
    // log action
    log("picker");
  }
}
