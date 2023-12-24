import $, {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  PropertyInspectorDidAppearEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { CheckpointManager } from "./manager";
import { groupBy, splitEvery } from "ramda";
import md5 from "md5";
import { Cache } from "@/util/cache";
import { CheckpointIcon } from "./checkpoint-icon";
import clipboard from "clipboardy";
import { GlobalSettings } from "@/settings";

interface CheckpointSettings {
  activity?: string;
  step?: string;
  difficulty?: "normal" | "master";
  cyclic?: boolean;
}

/**
 * Allow to copy the user handle to the clipboard (of specific checkpoint)
 */
@action({ UUID: "com.dim.streamdeck.checkpoint" })
export class Checkpoint extends SingletonAction {
  private findCheckpoint(settings: CheckpointSettings) {
    const { activity, step, difficulty } = settings;
    const hash = md5(`${activity}:${difficulty || "normal"}:${step}`);
    return CheckpointManager.items.find((it) => it.id === hash);
  }

  private async update(e: Action, settings: CheckpointSettings) {
    const checkpoint = this.findCheckpoint(settings);

    if (checkpoint) {
      const title = splitEvery(8, checkpoint.step).join("\n");
      e.setTitle(title);
    }

    if (checkpoint?.image) {
      const image = await Cache.canvas(
        checkpoint.image,
        checkpoint.image,
        () => (checkpoint.image ? CheckpointIcon(checkpoint.image) : undefined)
      );
      e.setImage(image);
    }
  }

  async onWillAppear(e: WillAppearEvent<CheckpointSettings>) {
    await CheckpointManager.refresh();
    this.update(e.action, e.payload.settings);
  }

  async onKeyDown(e: KeyDownEvent<CheckpointSettings>) {
    const checkpoint = this.findCheckpoint(e.payload.settings);
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

  async onPropertyInspectorDidAppear(
    e: PropertyInspectorDidAppearEvent<CheckpointSettings>
  ) {
    await CheckpointManager.refresh();
    e.action.sendToPropertyInspector({
      items: groupBy((it) => it.activity, CheckpointManager.items),
    });
  }
}
