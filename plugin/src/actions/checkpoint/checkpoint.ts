import $, {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { CheckpointManager } from "./manager";
import { splitEvery } from "ramda";
import { Cache } from "@/util/cache";
import { CheckpointIcon } from "./checkpoint-icon";
import clipboard from "clipboardy";
import { GlobalSettings } from "@/settings";

export interface CheckpointSettings {
  activity?: string;
  step?: string;
  image?: string;
  difficulty?: "normal" | "master";
  cyclic?: boolean;
}

/**
 * Allow to copy the user handle to the clipboard (of specific checkpoint)
 */
@action({ UUID: "com.dim.streamdeck.checkpoint" })
export class Checkpoint extends SingletonAction {
  private async update(e: Action, settings: CheckpointSettings) {
    if (settings.step) {
      const title = splitEvery(8, settings.step).join("\n");
      e.setTitle(title);
    }
    if (settings.image) {
      const image = await Cache.canvas(settings.image, settings.image, () =>
        settings.image ? CheckpointIcon(settings.image) : undefined
      );
      e.setImage(image);
    }
  }

  async onWillAppear(e: WillAppearEvent<CheckpointSettings>) {
    await CheckpointManager.refresh();
    this.update(e.action, e.payload.settings);
  }

  async onKeyDown(e: KeyDownEvent<CheckpointSettings>) {
    await CheckpointManager.refresh();
    const checkpoint = CheckpointManager.search(e.payload.settings);
    const globalSettings = await $.settings.getGlobalSettings<GlobalSettings>();
    if (checkpoint?.copyId) {
      clipboard.writeSync(
        `${globalSettings.checkpointJoinPrefix || "/join"} ${checkpoint.copyId}`
      );
      e.action.showOk();
    } else {
      e.action.showAlert();
    }
  }

  onDidReceiveSettings(ev: DidReceiveSettingsEvent<CheckpointSettings>) {
    this.update(ev.action, ev.payload.settings);
  }
}
