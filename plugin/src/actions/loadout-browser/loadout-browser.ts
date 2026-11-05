import $, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { Schemas } from "@plugin/types";
import { Profiles } from "../picker/util/options";
import { setupProfileGrid } from "@/lib/grid";
import { onLoadoutBrowserActivate } from "./manager";

@action({ UUID: "com.dim.streamdeck.loadout-browser" })
export class LoadoutBrowser extends SingletonAction {
  onKeyDown(e: KeyDownEvent) {
    const device = e.action.device;
    const suffix = Profiles[device.type];
    if (suffix === undefined || !device.size) {
      return e.action.showAlert();
    }
    const grid = setupProfileGrid({
      streamDeck: $,
      device: device.id,
      size: device.size,
      profile: `DIM${suffix}`,
      encoders: { enabled: device.type === 7, layout: "loadout-browser-layout.json" },
    });
    onLoadoutBrowserActivate(grid, device.id, Schemas.loadoutBrowser(e.payload.settings));
  }
}
