import $, {
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
  route,
} from "@elgato/streamdeck";
import { CheckpointIcon } from "./checkpoint-icon";
import clipboard from "clipboardy";
import { Watcher } from "@/util/watcher";
import { exec, spawn } from "child_process";
import { splitTitle } from "@/util/canvas";
import { CheckpointSettings, GlobalSettings, Schemas } from "@plugin/types";
import { log } from "@/util/logger";
import {
  definitions,
  getActivitiesDefinitions,
  searchCheckpoint,
} from "./manager";

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

  private async update(
    e: WillAppearEvent["action"],
    settings?: CheckpointSettings
  ) {
    const { id, encounter } =
      settings ?? Schemas.checkpoint(await e.getSettings());

    if (!id) return;

    const definition = definitions.get(id);

    if (!definition) return;

    const image = `${definition.images}/${encounter}.webp`;

    // update the step title
    e.setTitle(splitTitle(definition.encounters[encounter]));
    // update the image
    if (image) {
      const enabled = Boolean(searchCheckpoint({ id, encounter }));
      e.setImage(await CheckpointIcon(image, enabled));
    } else {
      e.setImage();
    }
  }

  async onWillAppear(e: WillAppearEvent) {
    this.watcher.start(e.action.id, () => this.update(e.action));
  }

  async onWillDisappear(e: WillDisappearEvent) {
    this.watcher.stop(e.action.id);
  }

  async onKeyDown(e: KeyDownEvent<CheckpointSettings>) {
    const cp = searchCheckpoint(e.payload.settings);
    if (cp) {
      const { command, paste } = await joinCommand(cp);
      clipboard.writeSync(command);
      paste && sendCommand();
      e.action.showOk();
    } else {
      e.action.showAlert();
    }
    // log action
    log("checkpoint");
  }

  @route("checkpoints-activities")
  async getDefinitions() {
    return getActivitiesDefinitions();
  }

  onDidReceiveSettings(e: DidReceiveSettingsEvent<CheckpointSettings>) {
    this.update(e.action, e.payload.settings);
  }
}
