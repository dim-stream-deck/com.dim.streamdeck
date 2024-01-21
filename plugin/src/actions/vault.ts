import { KeyDown, WillAppear, WillDisappear } from "@/settings";
import { State } from "@/state";
import { next } from "@/util/cyclic";
import { log } from "@/util/logger";
import { Watcher } from "@/util/watcher";
import {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
} from "@elgato/streamdeck";
import { Schemas, VaultSettings, VaultTypeSchema } from "@plugin/types";

/**
 * Show Vault counters
 */
@action({ UUID: "com.dim.streamdeck.vault" })
export class Vault extends SingletonAction {
  private watcher = Watcher("state");

  private async update(action: Action, settings?: VaultSettings) {
    const vault = State.get("vault");
    const { type } = settings ?? Schemas.vault(await action.getSettings());
    action.setImage(`./imgs/canvas/vault/${type}.png`);
    action.setTitle(`${vault?.[type]?.toLocaleString("en-US") ?? "?"}`);
  }

  onDidReceiveSettings(e: DidReceiveSettingsEvent<VaultSettings>) {
    this.update(e.action, e.payload.settings);
  }

  onWillAppear(e: WillAppear) {
    this.watcher.start(e.action.id, () => this.update(e.action));
  }

  onWillDisappear(e: WillDisappear) {
    this.watcher.stop(e.action.id);
  }

  // cycle through the available items
  onKeyDown(e: KeyDownEvent<VaultSettings>) {
    const current = Schemas.vault(e.payload.settings);
    const type = next(current.type, VaultTypeSchema.options);
    e.action.setSettings({ type });
    this.update(e.action);
    // log action
    log("vault");
  }
}
