extern crate separator;

use async_trait::async_trait;
use separator::Separatable;
use serde::{Deserialize, Serialize};
use skia_safe::Point;
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::events::{
    AppearEvent, DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent, KeyEvent,
};
use stream_deck_sdk::get_settings;
use stream_deck_sdk::stream_deck::StreamDeck;


use crate::dim::events_recv::Metrics;
use crate::shared::SHADOW;
use crate::util::{
    auto_margin, bungify, bytes_to_skia_image, download_or_cache, init_canvas, prepare_text,
    surface_to_b64,
};

pub struct MetricsAction;

#[derive(Serialize, Deserialize, Debug,)]
#[serde(rename_all = "camelCase")]
enum Metric {
    Vanguard,
    Gambit,
    Crucible,
    Gunsmith,
    IronBanner,
    Trials,
    BattlePass,
    Triumphs,
    TriumphsActive,
}

impl Metric {
    fn next_metric(&self) -> Metric {
        use Metric::*;
        match *self {
            Vanguard => Gambit,
            Gambit => Crucible,
            Crucible => Gunsmith,
            Gunsmith => IronBanner,
            IronBanner => Trials,
            Trials => BattlePass,
            BattlePass => Triumphs,
            Triumphs => TriumphsActive,
            TriumphsActive => Vanguard,
        }
    }
}
#[derive(Serialize, Deserialize, Debug)]
struct MetricsSettings {
    pub(crate) metric: Option<Metric>,
}

#[derive(Deserialize, Debug)]
struct PartialPluginSettings {
    pub(crate) metrics: Option<Metrics>,
}

async fn render_action(metric: Metric, metrics: Metrics) -> Option<String> {
    let value = match metric {
        Metric::Vanguard => metrics.vanguard,
        Metric::Gambit => metrics.gambit,
        Metric::Crucible => metrics.crucible,
        Metric::Trials => metrics.trials,
        Metric::IronBanner => metrics.iron_banner,
        Metric::Triumphs => metrics.triumphs,
        Metric::TriumphsActive => metrics.triumphs_active.unwrap_or_else(|| 0),
        Metric::Gunsmith => metrics.gunsmith,
        Metric::BattlePass => metrics.battle_pass,
    };

    let value = value.separated_string();

    let (file_image, bytes) = match metric {
        Metric::BattlePass => (
            None,
            download_or_cache(bungify(metrics.artifact_icon)).await,
        ),
        _ => (Some(format!("./images/metrics/{:?}.png", metric)), None),
    };

    if file_image.is_none() && bytes.is_none() {
        return None;
    }

    let (mut surface, paint, typeface) = init_canvas(file_image, bytes, 144);

    if let Metric::BattlePass = metric {
        let shadow = bytes_to_skia_image(SHADOW.clone());
        surface
            .canvas()
            .draw_image(&shadow, Point::new(0.0, 0.0), None);
    }

    let (label, (w, _)) = prepare_text(&value, &typeface, 28.0);

    surface
        .canvas()
        .draw_text_blob(label, Point::new(auto_margin(w), 120.0), &paint);

    Some(surface_to_b64(surface))
}

impl MetricsAction {
    async fn update(&self, context: String, sd: StreamDeck, settings: Option<MetricsSettings>) {
        let metrics = sd.global_settings::<PartialPluginSettings>().await.metrics;
        if let Some(metrics) = metrics {
            let metric = match settings {
                Some(settings) => settings.metric.unwrap_or(Metric::Vanguard),
                None => Metric::Vanguard,
            };
            let image = render_action(metric, metrics).await;
            if image.is_some() {
                sd.set_image_b64(context, image).await;
            }
        }
    }
}

#[async_trait]
impl Action for MetricsAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.metrics"
    }

    async fn on_appear(&self, e: AppearEvent, sd: StreamDeck) {
        let settings: MetricsSettings = get_settings(e.payload.settings);
        self.update(e.context, sd, Some(settings)).await;
    }

    async fn on_settings_changed(&self, e: DidReceiveSettingsEvent, sd: StreamDeck) {
        let settings: MetricsSettings = get_settings(e.payload.settings);
        self.update(e.context, sd, Some(settings)).await;
    }

    async fn on_global_settings_changed(&self, _e: DidReceiveGlobalSettingsEvent, sd: StreamDeck) {
        let instances = sd.contexts_of(self.uuid()).await;
        for ctx in instances {
            let settings: Option<MetricsSettings> = sd.settings(ctx.clone()).await;
            self.update(ctx.clone(), sd.clone(), settings).await
        }
    }

    async fn on_key_up(&self, e: KeyEvent, sd: StreamDeck) {
        let mut current_setting: MetricsSettings = get_settings(e.payload.settings);
        current_setting.metric = Some(
            current_setting
                .metric
                .unwrap_or(Metric::Vanguard)
                .next_metric(),
        );

        sd.set_settings(e.context.clone(), current_setting).await;
    }
}