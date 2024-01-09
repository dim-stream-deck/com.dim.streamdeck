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
import { Cache } from "@/util/cache";
import { CheckpointIcon } from "./checkpoint-icon";
import clipboard from "clipboardy";
import { Watcher } from "@/util/watcher";
import { exec, spawn } from "child_process";
import { splitTitle } from "@/util/canvas";
import { CheckpointSettings, GlobalSettings } from "@plugin/types";

/**
 * Generate the command to join the checkpoint
 * @param id user handle
 * @returns
 */
const joinCommand = async (id: string) => {
  const settings = await $.settings.getGlobalSettings<GlobalSettings>();
  return {
    command: `${settings.checkpointJoinPrefix || "/join"} ${id}`,
    paste: settings.checkpointPaste,
  };
};

/**
 * Type the command in the game/window
 * mac: use osascript to type the command (cmd+v, enter)
 * windows: use a macro executable (rust compiled) to run the command (ctrl+v, enter)
 * @param command the string to paste
 */
const sendCommand = () => {
  if ($.info.application.platform === "mac") {
    exec(
      `osascript -e 'tell application "System Events"' -e 'keystroke "v" using command down' -e 'key code 36' -e 'end tell'`
    );
  } else {
    spawn(`./macro/macro.exe`);
  }
};

/**
 * Allow to copy the user handle to the clipboard (of specific checkpoint)
 */
@action({ UUID: "com.dim.streamdeck.checkpoint" })
export class Checkpoint extends SingletonAction {
  private watcher = Watcher("checkpoints");

  private async update(e: Action, settings: CheckpointSettings) {
    // update the step title
    e.setTitle(splitTitle(settings.step));
    // update the image
    if (settings.image) {
      const enabled = Boolean(CheckpointManager.search(settings));
      const image = await Cache.canvas(`${settings.activity}/${enabled}`, () =>
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

  async onWillDisappear(e: WillDisappearEvent<CheckpointSettings>) {
    this.watcher.stop(e.action.id);
  }

  async onKeyDown(e: KeyDownEvent<CheckpointSettings>) {
    await CheckpointManager.refresh();
    const cp = CheckpointManager.search(e.payload.settings);
    if (cp?.copyId) {
      const { command, paste } = await joinCommand(cp.copyId);
      await clipboard.write(command);
      paste && sendCommand();
      e.action.showOk();
    } else {
      e.action.showAlert();
    }
  }

  async onDidReceiveSettings(ev: DidReceiveSettingsEvent<CheckpointSettings>) {
    this.update(ev.action, ev.payload.settings);
  }
}
