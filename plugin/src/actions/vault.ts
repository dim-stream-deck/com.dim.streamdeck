import { State, VaultType, VaultTypes } from "@/state";
import { next } from "@/util/cyclic";
import { Watcher } from "@/util/watcher";
import $, {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";

interface VaultSettings {
  item?: VaultType;
}

// Convert a deprecated item name to the new one.
const processItem = (item?: VaultType) =>
  item === "dust" ? "brightDust" : item ?? "vault";

/**
 * Show Vault counters
 */
@action({ UUID: "com.dim.streamdeck.vault" })
export class Vault extends SingletonAction {
  private watcher = Watcher("state");

  private update(action: Action, settings: VaultSettings) {
    const vault = State.get("vault");
    const item = processItem(settings.item);
    action.setImage(`./imgs/canvas/vault/${item}.png`);
    action.setTitle(`${vault?.[item] ?? "?"}`);
  }

  async onDidReceiveSettings(ev: DidReceiveSettingsEvent<VaultSettings>) {
    this.update(ev.action, ev.payload.settings);
  }

  async onWillAppear(e: WillAppearEvent<VaultSettings>) {
    this.watcher.start(e.action.id, async () =>
      this.update(e.action, await e.action.getSettings<VaultSettings>())
    );
  }

  onWillDisappear(e: WillDisappearEvent<VaultSettings>) {
    this.watcher.stop(e.action.id);
  }

  async onKeyDown(e: KeyDownEvent<VaultSettings>) {
    // cycle through the available items
    const current = processItem(e.payload.settings.item);
    const item = next(current, VaultTypes);
    e.action.setSettings({ item });
    // update current button
    this.update(e.action, { item });
  }
}
