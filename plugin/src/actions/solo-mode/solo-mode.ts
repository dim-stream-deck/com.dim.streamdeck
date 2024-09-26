import {
	action,
	KeyDownEvent,
	SendToPluginEvent,
	SingletonAction,
	WillAppearEvent
} from "@elgato/streamdeck";
import { exec } from "child_process";
import { checkInstalledService } from "./service";
import { log } from "@/util/logger";
import { join } from "path";
import { existsSync } from "fs";
import { copyFile } from "fs/promises";

type PropertyInspectorData = {
  action: "remove-service" | "install-service";
};

type ServiceAction = "status" | "toggle";

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
    const status = await this.invoke(action);
    e.setImage(`./imgs/canvas/solo-mode/${status ? "on" : "off"}.png`);
  };

  private async invoke(action: ServiceAction) {
    const response = await fetch(`http://localhost:9121?action=${action}`);
    const status = await response.text();
    return status === "true";
  }

  onWillAppear(e: WillAppearEvent) {
    this.updateState(e.action, "status");
  }

  onKeyDown(e: KeyDownEvent) {
    this.updateState(e.action, "toggle");
    // log action
    log("solo-mode");
  }

  async onSendToPlugin(e: SendToPluginEvent<PropertyInspectorData, any>) {
    const prefix =
      e.payload.action === "install-service" ? "install" : "remove";

    // calc the service path outside the plugin directory (to avoid issues on update)
    const servicePath = join(process.env.APPDATA!, "./sd-solo-mode.exe");

    // copy the service if it doesn't exist
    if (!existsSync(servicePath)) {
      await copyFile("./solo-mode/sd-solo-mode.exe", servicePath);
    }

    // run the installer/remover
    const p = exec(`start ./solo-mode/${prefix}-sd-solo-mode.exe`);

    // verify and update the global settings
    p.on("exit", () =>
      setTimeout(
        async () =>
          (await checkInstalledService()) &&
          this.updateState(e.action as WillAppearEvent["action"], "status"),
        1500
      )
    );
  }
}

checkInstalledService();
