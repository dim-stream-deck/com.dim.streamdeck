import { DIM } from "@/dim/api";
import { action, SingletonAction } from "@elgato/streamdeck";

/**
 * Trigger the refresh action on DIM.
 */
@action({ UUID: "com.dim.streamdeck.loadout" })
export class Loadout extends SingletonAction {
  async onKeyDown() {
    // DIM.refresh();
  }

  onPropertyInspectorDidAppear() {
    DIM.selection({ active: true, type: "loadout" });
  }

  onPropertyInspectorDidDisappear() {
    DIM.selection({ active: false });
  }
}
