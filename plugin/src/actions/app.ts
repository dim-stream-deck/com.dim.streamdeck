import $, { action, SingletonAction } from "@elgato/streamdeck";
import { spawn } from "child_process";
import { Schemas } from "@plugin/types";
import { KeyUp } from "@/settings";

/**
 * Open DIM application in Chrome
 * @param env of the application (beta or app)
 */
const openChromeApp = (env: string) => {
  const appId =
    env === "beta"
      ? "enmhfhfpkdkdgbhjafjkkfdmeopcfiig"
      : "aeeidfelonceeehdppacnjlimhoneige";

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
    // extract the env from type
    const [env] = setting.type.split("-");
    // open the app
    switch (setting.type) {
      case "app-browser":
      case "beta-browser":
        $.system.openUrl(`https://${env}.destinyitemmanager.com`);
        break;
      case "app-chrome":
      case "beta-chrome":
        openChromeApp(env);
        break;
      case "app-windows":
        openWindowsApp();
    }
    // show ok icon
    e.action.showOk();
  }
}
