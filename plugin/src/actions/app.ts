import $, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

interface AppSettings {
  beta?: boolean;
}

/**
 * Open DIM application
 */
@action({ UUID: "com.dim.streamdeck.app" })
export class App extends SingletonAction {
  onKeyDown(e: KeyDownEvent<AppSettings>) {
    $.system.openUrl(
      `https://${
        e.payload.settings?.beta ? "beta" : "app"
      }.destinyitemmanager.com`
    );
  }
}
