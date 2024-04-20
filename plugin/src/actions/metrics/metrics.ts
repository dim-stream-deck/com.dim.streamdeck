import { Watcher } from "@/util/watcher";
import {
  Action,
  action,
  DidReceiveSettingsEvent,
  KeyDownEvent,
  SingletonAction,
} from "@elgato/streamdeck";
import { ArtifactIcon } from "./artifact-icon";
import { State } from "@/state";
import { MetricsSettings, Schemas } from "@plugin/types";
import { WillAppear, WillDisappear } from "@/settings";
import { log } from "@/util/logger";
import { Cycler } from "@/lib/cycle";

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
      ? await ArtifactIcon(icon)
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

  onKeyDown(e: KeyDownEvent<MetricsSettings>) {
    const { pinned, order, metric, disabled } = Schemas.metrics(
      e.payload.settings
    );
    // ignore if pinned
    if (pinned) {
      return;
    }
    // filter out disabled items
    const metrics = new Cycler(
      order.filter((metric) => !disabled?.includes(metric))
    );

    // cycle through the available items
    e.action.setSettings({
      pinned,
      order,
      disabled,
      metric: metrics.after(metric),
    });
    // update button
    this.update(e.action);
    // log action
    log("metrics");
  }
}
