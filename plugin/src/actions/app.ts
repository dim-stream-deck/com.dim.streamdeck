import $, { action, KeyUpEvent, SingletonAction } from "@elgato/streamdeck";
import { spawn } from "child_process";
import { AppSettings } from "shared";

const Mapping = {
  "app-browser": "https://app.destinyitemmanager.com",
  "beta-browser": "https://beta.destinyitemmanager.com",
  "app-chrome": "aeeidfelonceeehdppacnjlimhoneige",
  "beta-chrome": "enmhfhfpkdkdgbhjafjkkfdmeopcfiig",
  "app-windows":
    "2464DIMDestinyItemManager.DestinyItemManagerDIM_2jn1m2rfzb8fg!App",
};

/**
 * Open DIM application
 */
@action({ UUID: "com.dim.streamdeck.app" })
export class App extends SingletonAction {
  onKeyUp(e: KeyUpEvent<AppSettings>) {
    const type =
      e.payload.settings.type ??
      (e.payload.settings.beta ? "beta-browser" : "app-browser");

    switch (type) {
      case "app-browser":
      case "beta-browser":
        $.system.openUrl(Mapping[type]);
        break;
      case "app-chrome":
      case "beta-chrome":
        spawn("C:/Program Files/Google/Chrome/Application/chrome_proxy.exe", [
          "--profile-directory=Default",
          `--app-id=${Mapping[type]}`,
        ]);
        break;
      case "app-windows":
        spawn("explorer.exe", [`shell:AppsFolder\\${Mapping[type]}`]);
    }
    e.action.showOk();
  }
}
