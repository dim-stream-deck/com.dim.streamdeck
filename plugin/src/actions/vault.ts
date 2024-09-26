import { Cycler } from "@/lib/cycle";
import { State } from "@/state";
import { log } from "@/util/logger";
import { Watcher } from "@/util/watcher";
import {
	action,
	DidReceiveSettingsEvent,
	KeyDownEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent
} from "@elgato/streamdeck";
import { Schemas, VaultSettings, VaultTypeSchema } from "@plugin/types";

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
    const vault = State.get("vault");
    const { type } = settings ?? Schemas.vault(await action.getSettings());
    action.setImage(`./imgs/canvas/vault/${type}.png`);
    action.setTitle(`${vault?.[type]?.toLocaleString("en-US") ?? "?"}`);
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
    const current = Schemas.vault(e.payload.settings);
    const type = new Cycler(VaultTypeSchema.options).after(current.type);
    e.action.setSettings({ type });
    this.update(e.action);
    // log action
    log("vault");
  }
}
