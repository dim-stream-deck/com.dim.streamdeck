import { DIM } from "@/dim/api";
import { downloadAsBase64 } from "@/lib/image";
import { State } from "@/state";
import { bungify } from "@/util/images";
import { log } from "@/util/logger";
import { Watcher } from "@/util/watcher";
import {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { Schemas, VaultSettings } from "@plugin/types";

/**
 * Show Vault counters
 */
@action({ UUID: "com.dim.streamdeck.vault" })
export class Vault extends SingletonAction {
  private watcher = Watcher("state");

  private async update(
    action: WillAppearEvent["action"],
    settings?: VaultSettings
  ) {
    const vault = State.get("inventory");
    const { current = 0, items = [] } =
      settings ?? Schemas.vault(await action.getSettings());
    const item = items[current];
    if (item) {
      const image = await downloadAsBase64(bungify(item.icon));
      image && action.setImage(image);
      action.setTitle(`${vault?.[item.item]?.toLocaleString("en-US") ?? "?"}`);
    }
  }

  onDidReceiveSettings(e: DidReceiveSettingsEvent<VaultSettings>) {
    this.update(e.action, e.payload.settings);
  }

  onWillAppear(e: WillAppearEvent) {
    this.watcher.start(e.action.id, () => this.update(e.action));
  }

  onWillDisappear(e: WillDisappearEvent) {
    this.watcher.stop(e.action.id);
  }

  // cycle through the available items
  onKeyDown(e: KeyDownEvent<VaultSettings>) {
    const settings = Schemas.vault(e.payload.settings);
    e.action.setSettings({
      ...settings,
      current: (settings.current + 1) % settings.items.length,
    });
    this.update(e.action);
    // log action
    log("vault");
  }

  onPropertyInspectorDidAppear() {
    DIM.selection({ type: "inventory-item" });
  }

  onPropertyInspectorDidDisappear() {
    DIM.selection();
  }
}
