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
    if (e.isNeoInfobar()) return;
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

export const updateSoloService = async (action: "install" | "remove") => {
  // calc the service path outside the plugin directory (to avoid issues on update)
  const servicePath = join(process.env.APPDATA!, "./sd-solo-mode.exe");

  // copy the service if it doesn't exist
  if (!existsSync(servicePath)) {
    await copyFile("./solo-mode/sd-solo-mode.exe", servicePath);
  }

  // run the installer/remover
  const p = exec(`start ./solo-mode/${action}-sd-solo-mode.exe`);

  await new Promise<void>((resolve, reject) => {
    p.on("error", reject);
    p.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Service installer exited with ${code}`)));
  });
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const installed = await checkInstalledService();
  const status = installed && await invoke("status");
  for (const key of $.actions) {
    if (key.manifestId === "com.dim.streamdeck.solo-mode" && key.isKey()) {
      await key.setImage(imageState(status));
    }
  }
};

checkInstalledService();
