import $, { action, SingletonAction } from "@elgato/streamdeck";
import { exec, spawn } from "child_process";
import { Schemas } from "@plugin/types";
import { KeyUp } from "@/settings";
import { log } from "@/util/logger";

/**
 * Open DIM application in Chrome
 * @param env of the application (beta or app)
 */
const openPWA = (beta: boolean, isEdge = false) => {
  const appId = beta
    ? "enmhfhfpkdkdgbhjafjkkfdmeopcfiig"
    : "aeeidfelonceeehdppacnjlimhoneige";

  if (isEdge) {
    return exec(`start msedge --app-id=${appId}`, {});
  }

  spawn("C:/Program Files/Google/Chrome/Application/chrome_proxy.exe", [
    "--profile-directory=Default",
    `--app-id=${appId}`,
  ]);
};

/**
 * Open DIM application in Windows
 */
const openWindowsApp = () => {
  spawn("explorer.exe", [
    `shell:AppsFolder\\2464DIMDestinyItemManager.DestinyItemManagerDIM_2jn1m2rfzb8fg!App`,
  ]);
};

/**
 * Open DIM application
 */
@action({ UUID: "com.dim.streamdeck.app" })
export class App extends SingletonAction {
  async onKeyUp(e: KeyUp) {
    // validate settings
    const setting = Schemas.app(e.payload.settings);
    // extract the settings
    const { open, beta } = setting;
    // open the app
    switch (open) {
      case "browser":
        $.system.openUrl(
          `https://${beta ? "beta" : "app"}.destinyitemmanager.com`
        );
        break;
      case "chrome":
      case "edge":
        openPWA(beta, open === "edge");
        break;
      case "windows":
        openWindowsApp();
    }
    // show ok icon
    e.action.showOk();
    // log action
    log("app");
  }
}
