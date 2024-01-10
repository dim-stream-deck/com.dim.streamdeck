import { Cache } from "@/util/cache";
import { next } from "@/util/cyclic";
import { Watcher } from "@/util/watcher";
import {
  Action,
  action,
  DidReceiveSettingsEvent,
  SingletonAction,
} from "@elgato/streamdeck";
import { ArtifactIcon } from "./artifact-icon";
import { State } from "@/state";
import { MetricsSettings, Schemas } from "@plugin/types";
import {
  DidReceiveSettings,
  WillAppear,
  WillDisappear,
  KeyDown,
} from "@/settings";

/**
 * Show Destiny Metrics
 */
@action({ UUID: "com.dim.streamdeck.metrics" })
export class Metrics extends SingletonAction {
  private watcher = Watcher("state");

  private async update(action: Action, settings?: MetricsSettings) {
    const { metric } = settings ?? Schemas.metrics(await action.getSettings());
    const metrics = State.get("metrics");

    // detect if the metric is the artifact
    const icon = metric === "battlePass" ? metrics?.artifactIcon : undefined;

    const image = icon
      ? await Cache.canvas(icon, () => ArtifactIcon(icon))
      : `./imgs/canvas/metrics/${metric}.png`;

    action.setTitle(`${metrics?.[metric] ?? "?"}`);
    action.setImage(image);
  }

  onDidReceiveSettings(e: DidReceiveSettingsEvent<MetricsSettings>) {
    this.update(e.action, e.payload.settings);
  }

  onWillAppear(e: WillAppear) {
    this.watcher.start(e.action.id, () => this.update(e.action));
  }

  onWillDisappear(e: WillDisappear) {
    this.watcher.stop(e.action.id);
  }

  onKeyDown(e: KeyDown) {
    const { pinned, order, metric, disabled } = Schemas.metrics(
      e.payload.settings
    );
    // ignore if pinned
    if (pinned) {
      return;
    }
    // filter out disabled items
    const metrics = order.filter((metric) => !disabled?.includes(metric));
    // cycle through the available items
    e.action.setSettings({
      metric: next(metric, metrics),
    });
    // update button
    this.update(e.action);
  }
}
