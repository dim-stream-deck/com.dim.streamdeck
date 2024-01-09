import { Cache } from "@/util/cache";
import { next } from "@/util/cyclic";
import { Watcher } from "@/util/watcher";
import {
	Action,
	action,
	DidReceiveSettingsEvent,
	KeyDownEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent,
} from "@elgato/streamdeck";
import { ArtifactIcon } from "./artifact-icon";
import { mergeRight } from "ramda";
import { MetricType, State } from "@/state";

interface MetricsSettings {
  metric?: MetricType;
  disabled?: MetricType[];
  order?: MetricType[];
  pinned?: boolean;
}

const defaults = {
  order: [
    "battlePass",
    "vanguard",
    "gambit",
    "crucible",
    "gunsmith",
    "ironBanner",
    "trials",
    "triumphs",
    "triumphsActive",
  ],
} as const;

/**
 * Show Destiny Metrics
 */
@action({ UUID: "com.dim.streamdeck.metrics" })
export class Metrics extends SingletonAction {
  private watcher = Watcher("state");

  private async update(action: Action, settings: MetricsSettings) {
    const metric = settings.metric ?? "battlePass";
    const metrics = State.get("metrics");

    const icon = metric === "battlePass" ? metrics?.artifactIcon : undefined;

    const image = icon
      ? await Cache.canvas(icon, () => ArtifactIcon(icon))
      : `./imgs/canvas/metrics/${metric}.png`;

    if (image) {
      action.setImage(image);
    }

    action.setTitle(`${metrics?.[metric] ?? "?"}`);
  }

  async onDidReceiveSettings(ev: DidReceiveSettingsEvent<MetricsSettings>) {
    this.update(ev.action, ev.payload.settings);
  }

  async onWillAppear(e: WillAppearEvent<MetricsSettings>) {
    this.watcher.start(e.action.id, async () => {
      const settings = await e.action.getSettings<MetricsSettings>();
      this.update(e.action, settings);
    });
  }

  onWillDisappear(e: WillDisappearEvent<MetricsSettings>) {
    this.watcher.stop(e.action.id);
  }

  async onKeyDown(e: KeyDownEvent<MetricsSettings>) {
    const settings = mergeRight(defaults, e.payload.settings);
    // ignore if pinned
    if (settings.pinned) {
      return;
    }
    // filter out disabled items
    const metrics = settings.order.filter(
      (metric) => !settings.disabled?.includes(metric)
    );
    // cycle through the available items
    const metric = next(e.payload.settings.metric ?? metrics[0], metrics);
    e.action.setSettings({ metric });
    // update button
    this.update(e.action, { metric });
  }
}
