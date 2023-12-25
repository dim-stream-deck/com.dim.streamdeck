import { GlobalSettings, MetricType, MetricTypes } from "@/settings";
import { Cache } from "@/util/cache";
import { next } from "@/util/cyclic";
import { Watcher } from "@/util/watcher";
import $, {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { ArtifactIcon } from "./artifact-icon";

interface MetricsSettings {
  metric?: MetricType;
}

/**
 * Show Destiny Metrics
 */
@action({ UUID: "com.dim.streamdeck.metrics" })
export class Metrics extends SingletonAction {
  private watcher = Watcher("state");

  private async update(
    action: Action,
    settings: MetricsSettings,
    globalSettings: GlobalSettings
  ) {
    const metric = settings.metric ?? "battlePass";

    const icon =
      metric === "battlePass"
        ? globalSettings.metrics?.artifactIcon
        : undefined;

    const image = icon
      ? await Cache.canvas(icon, () => ArtifactIcon(icon))
      : `./imgs/canvas/metrics/${metric}.png`;

    if (image) {
      action.setImage(image);
    }

    action.setTitle(`${globalSettings.metrics?.[metric] ?? "?"}`);
  }

  async onDidReceiveSettings(ev: DidReceiveSettingsEvent<MetricsSettings>) {
    const globalSettings = await $.settings.getGlobalSettings<GlobalSettings>();
    this.update(ev.action, ev.payload.settings, globalSettings);
  }

  async onWillAppear(e: WillAppearEvent<MetricsSettings>) {
    this.watcher.start(e.action.id, async () => {
      const settings = await e.action.getSettings<MetricsSettings>();
      this.update(
        e.action,
        settings,
        await $.settings.getGlobalSettings<GlobalSettings>()
      );
    });
  }

  onWillDisappear(e: WillDisappearEvent<MetricsSettings>) {
    this.watcher.stop(e.action.id);
  }

  async onKeyDown(e: KeyDownEvent<MetricsSettings>) {
    // cycle through the available items
    const metric = next(e.payload.settings.metric ?? "battlePass", MetricTypes);
    e.action.setSettings({ metric });
    // update current button
    const globalSettings = $.settings.getGlobalSettings<GlobalSettings>();
    this.update(e.action, { metric }, await globalSettings);
  }
}
