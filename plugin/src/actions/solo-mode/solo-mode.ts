import { NoSettings } from "@/settings";
import {
  Action,
  action,
  KeyDownEvent,
  SendToPluginEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { exec } from "child_process";
import { checkInstalledService } from "./service";

interface PropertyInspectorData {
  action: "remove-service" | "install-service";
}

type ServiceAction = "status" | "toggle";

/**
 * Trigger the solo mode status (if the Windows services is running)
 */
@action({ UUID: "com.dim.streamdeck.solo-mode" })
export class SoloMode extends SingletonAction {
  // update the state of the button
  private updateState = async (e: Action, action: ServiceAction) => {
    const status = await this.invoke(action);
    e.setImage(`./imgs/canvas/solo-mode/${status ? "on" : "off"}.png`);
  };

  private async invoke(action: ServiceAction) {
    const response = await fetch(`http://localhost:9121?action=${action}`);
    const status = await response.text();
    return status === "true";
  }

  onWillAppear(e: WillAppearEvent<NoSettings>) {
    this.updateState(e.action, "status");
  }

  onKeyDown(e: KeyDownEvent<NoSettings>) {
    this.updateState(e.action, "toggle");
  }

  async onSendToPlugin(
    e: SendToPluginEvent<PropertyInspectorData, NoSettings>
  ) {
    const prefix =
      e.payload.action === "install-service" ? "install" : "remove";
    // run the installer/remover
    const p = exec(`start ./solo-mode/${prefix}-sd-solo-enabler.exe`);
    // verify and update the global settings
    p.on("exit", () =>
      setTimeout(
        async () =>
          (await checkInstalledService()) &&
          this.updateState(e.action, "status"),
        1500
      )
    );
  }
}

checkInstalledService();
