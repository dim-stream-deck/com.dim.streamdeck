use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use skia_safe::{Color, Point};
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::events::{
    AppearEvent, DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent, KeyEvent,
};
use stream_deck_sdk::get_settings;
use stream_deck_sdk::stream_deck::StreamDeck;

use crate::dim::events_recv::MaxPower;
use crate::dim::with_action;
use crate::util::{auto_margin, prepare_render, prepare_text, surface_to_b64};

pub struct MaxPowerAction;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
enum PowerType {
    All,
    Total,
    Base,
    Artifact,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MaxPowerSettings {
    pub(crate) power_type: Option<PowerType>,
}

#[derive(Deserialize, Debug)]
struct PartialPluginSettings {
    #[serde(rename = "maxPower")]
    pub(crate) max_power: Option<MaxPower>,
}

fn render_action(power_type: PowerType, max_power: MaxPower) -> Option<String> {
    let file_image = format!("./images/max-power/{:?}.png", power_type);
    let (mut surface, mut paint, typeface) = prepare_render(file_image, 144);

    if max_power.total.is_none() || max_power.base.is_none() || max_power.artifact.is_none() {
        return None;
    }

    let total = max_power.total.unwrap();
    let base = max_power.base.unwrap();
    let artifact = max_power.artifact.unwrap();

    match power_type {
        PowerType::All => {
            let (base, _) = prepare_text(&base, &typeface, 26.0);
            let (artifact, _) = prepare_text(&artifact.to_string(), &typeface, 26.0);
            let (total, (w, _)) = prepare_text(&total, &typeface, 31.0);

            surface
                .canvas()
                .draw_text_blob(total, Point::new(auto_margin(w), 126.0), &paint);

            paint.set_color(Color::from_argb(100, 255, 255, 255));

            surface
                .canvas()
                .draw_text_blob(base, Point::new(50.0, 34.0), &paint)
                .draw_text_blob(artifact, Point::new(50.0, 80.0), &paint);
        }
        _ => {
            let (level, y) = match power_type {
                PowerType::Total => (total, 126.0),
                PowerType::Base => (base, 128.0),
                PowerType::Artifact => (artifact.to_string(), 128.0),
                _ => unreachable!(),
            };
            let (label, (w, _)) = prepare_text(&level, &typeface, 28.0);
            surface
                .canvas()
                .draw_text_blob(label, Point::new(auto_margin(w), y), &paint);
        }
    }

    Some(surface_to_b64(surface))
}

impl MaxPowerAction {
    async fn update(&self, context: String, sd: StreamDeck, settings: Option<MaxPowerSettings>) {
        let global = sd.global_settings::<PartialPluginSettings>().await;
        if let Some(global) = global {
            if let Some(max_power) = global.max_power {
                let settings = settings.unwrap();
                let power_type = settings.power_type.unwrap_or(PowerType::All);
                let image = render_action(power_type, max_power);
                sd.set_image_b64(context, image).await;
            }
        }
    }
}

#[async_trait]
impl Action for MaxPowerAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.power"
    }

    async fn on_appear(&self, e: AppearEvent, sd: StreamDeck) {
        let settings: Option<MaxPowerSettings> = get_settings(e.payload.settings);
        self.update(e.context, sd, settings).await;
    }

    async fn on_key_down(&self, e: KeyEvent, sd: StreamDeck) {
        sd.external(with_action("maxPower", String::new())).await;
        sd.show_ok(e.context).await;
    }

    async fn on_settings_changed(&self, e: DidReceiveSettingsEvent, sd: StreamDeck) {
        let settings: Option<MaxPowerSettings> = get_settings(e.payload.settings);
        self.update(e.context, sd, settings).await;
    }

    async fn on_global_settings_changed(&self, _e: DidReceiveGlobalSettingsEvent, sd: StreamDeck) {
        let instances = sd.contexts_of(self.uuid()).await;
        for ctx in instances {
            let settings: Option<MaxPowerSettings> = sd.settings(ctx.clone()).await;
            self.update(ctx.clone(), sd.clone(), settings).await
        }
    }
}
