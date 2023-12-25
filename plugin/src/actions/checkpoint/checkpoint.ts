import $, {
	Action,
	action,
	DidReceiveSettingsEvent,
	KeyDownEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent,
} from "@elgato/streamdeck";
import { CheckpointManager } from "./manager";
import { splitEvery } from "ramda";
import { Cache } from "@/util/cache";
import { CheckpointIcon } from "./checkpoint-icon";
import clipboard from "clipboardy";
import { GlobalSettings } from "@/settings";
import { Watcher } from "@/util/watcher";

export interface CheckpointSettings {
  activity?: string;
  step?: string;
  image?: string;
  difficulty?: "normal" | "master";
}

/**
 * Allow to copy the user handle to the clipboard (of specific checkpoint)
 */
@action({ UUID: "com.dim.streamdeck.checkpoint" })
export class Checkpoint extends SingletonAction {
  private watcher = Watcher("checkpoints");

  private async update(e: Action, settings: CheckpointSettings) {
    // update the step title
    e.setTitle(splitEvery(8, settings.step ?? "").join("\n"));
    // update the image
    if (settings.image) {
      const enabled = Boolean(CheckpointManager.search(settings));
      const image = await Cache.canvas(
        `${settings.activity}/${enabled}`,
        settings.image,
        () =>
          settings.image ? CheckpointIcon(settings.image, enabled) : undefined
      );
      e.setImage(image);
    } else {
      e.setImage(undefined);
    }
  }

  async onWillAppear(e: WillAppearEvent<CheckpointSettings>) {
    await CheckpointManager.refresh();
    this.watcher.start(e.action.id, async () => {
      const settings = await e.action.getSettings<CheckpointSettings>();
      this.update(e.action, settings);
    });
  }

  onWillDisappear(e: WillDisappearEvent<CheckpointSettings>) {
    this.watcher.stop(e.action.id);
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
