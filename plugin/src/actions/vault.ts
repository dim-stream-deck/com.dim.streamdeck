import { GlobalSettings, VaultType, VaultTypes } from "@/settings";
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

  private update(
    action: Action,
    settings: VaultSettings,
    globalSettings: GlobalSettings
  ) {
    const item = processItem(settings.item);
    action.setImage(`./imgs/canvas/vault/${item}.png`);
    action.setTitle(`${globalSettings.vault?.[item] ?? "?"}`);
  }

  async onDidReceiveSettings(ev: DidReceiveSettingsEvent<VaultSettings>) {
    const globalSettings = await $.settings.getGlobalSettings<GlobalSettings>();
    this.update(ev.action, ev.payload.settings, globalSettings);
  }

  async onWillAppear(e: WillAppearEvent<VaultSettings>) {
    this.watcher.start(e.action.id, async () =>
      this.update(
        e.action,
        e.payload.settings,
        await $.settings.getGlobalSettings<GlobalSettings>()
      )
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
    const globalSettings = $.settings.getGlobalSettings<GlobalSettings>();
    this.update(e.action, { item }, await globalSettings);
  }
}
