import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { exec } from "child_process";
import { checkInstalledService } from "./service";
import { log } from "@/util/logger";
import { join } from "path";
import { existsSync } from "fs";
import { copyFile } from "fs/promises";
import $ from "@elgato/streamdeck";

type ServiceAction = "status" | "toggle";

const invoke = async (action: ServiceAction) => {
  const response = await fetch(`http://localhost:9121?action=${action}`);
  const status = await response.text();
  return status === "true";
};

const imageState = (status: boolean) =>
  `./imgs/canvas/solo-mode/${status ? "on" : "off"}.png`;

/**
 * Trigger the solo mode status (if the Windows services is running)
 */
@action({ UUID: "com.dim.streamdeck.solo-mode" })
export class SoloMode extends SingletonAction {
  // update the state of the button
  private updateState = async (
    e: WillAppearEvent["action"],
    action: ServiceAction
  ) => {
    const status = await invoke(action);
    e.setImage(imageState(status));
  };

  onWillAppear(e: WillAppearEvent) {
    this.updateState(e.action, "status");
  }

  onKeyDown(e: KeyDownEvent) {
    this.updateState(e.action, "toggle");
    // log action
    log("solo-mode");
  }
}

$.ui.registerRoute("update-solo-service", async (req, res) => {
  // calc the service path outside the plugin directory (to avoid issues on update)
  const servicePath = join(process.env.APPDATA!, "./sd-solo-mode.exe");

  // copy the service if it doesn't exist
  if (!existsSync(servicePath)) {
    await copyFile("./solo-mode/sd-solo-mode.exe", servicePath);
  }

  // get the action
  const action = req.body as ServiceAction;

  // run the installer/remover
  const p = exec(`start ./solo-mode/${action}-sd-solo-mode.exe`);

  // verify and update the global settings
  p.on("exit", () =>
    setTimeout(async () => {
      if ((await checkInstalledService()) && req.action.isKey()) {
        const status = await invoke(action);
        req.action.setImage(imageState(status));
        res.send(200, "OK");
      }
    }, 1500)
  );
});

checkInstalledService();
