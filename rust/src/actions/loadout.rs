use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::json;
use skia_safe::{Color, Rect};
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::events::{
    AppearEvent, DidReceiveSettingsEvent, KeyEvent, SendToPluginEvent,
};
use stream_deck_sdk::get_settings;
use stream_deck_sdk::stream_deck::StreamDeck;

use crate::dim::events_sent::Selection;
use crate::dim::with_action;
use crate::json_string;
use crate::shared::SHARED;
use crate::util::{
    bungify, bytes_to_skia_image, download_or_cache, prepare_render_empty, surface_to_b64,
};

pub struct LoadoutAction;

#[derive(Serialize, Deserialize, Debug)]
pub struct LoadoutSettings {
    pub(crate) loadout: Option<String>,
    pub(crate) label: Option<String>,
    pub(crate) subtitle: Option<String>,
    pub(crate) icon: Option<String>,
    pub(crate) character: Option<String>,
}

#[derive(Serialize, Debug)]
pub struct EquipLoadoutItem {
    pub(crate) loadout: String,
    pub(crate) character: Option<String>,
}

async fn render_action(settings: LoadoutSettings) -> Option<String> {
    if settings.icon.is_none() {
        return None;
    }

    let image = download_or_cache(bungify(settings.icon)).await;

    if image.is_none() {
        return None;
    }

    let size = 96.0;
    let (mut surface, paint, _) = prepare_render_empty(size as i32);
    let image = bytes_to_skia_image(image.unwrap());

    surface
        .canvas()
        .clear(Color::from_argb(0, 0, 0, 0))
        .draw_image_rect(
            image,
            None,
            Rect::new(3.0, 3.0, size - 3.0, size - 3.0),
            &paint,
        );

    return Some(surface_to_b64(surface));
}

impl LoadoutAction {
    async fn update(&self, context: String, settings: LoadoutSettings, sd: StreamDeck) {
        let label = settings.label.clone();
        let image = render_action(settings).await;
        sd.set_image_b64(context.clone(), image).await;
        if label.is_some() {
            sd.set_title(context, Some(label.unwrap().replace(" ", "\n")))
                .await;
        }
    }

    async fn equip_loadout(
        &self,
        sd: StreamDeck,
        context: String,
        settings: LoadoutSettings,
        vault: bool,
    ) {
        if let Some(loadout) = settings.loadout {
            let character = if vault {
                Some("vault".to_string())
            } else {
                settings.character
            };
            let data = EquipLoadoutItem { loadout, character };
            sd.external(with_action("loadout", json_string!(&data)))
                .await;
            sd.show_ok(context).await;
        } else {
            sd.show_alert(context).await;
        }
    }
}

#[async_trait]
impl Action for LoadoutAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.loadout"
    }

    fn long_timeout(&self) -> f32 {
        750.0
    }

    async fn on_appear(&self, e: AppearEvent, sd: StreamDeck) {
        let settings = get_settings(e.payload.settings);
        self.update(e.context, settings, sd).await;
    }

    async fn on_key_up(&self, e: KeyEvent, sd: StreamDeck) {
        let settings: LoadoutSettings = get_settings(e.payload.settings);
        self.equip_loadout(sd, e.context, settings, e.is_double_tap)
            .await;
    }

    async fn on_settings_changed(&self, e: DidReceiveSettingsEvent, sd: StreamDeck) {
        let settings = get_settings(e.payload.settings);
        self.update(e.context, settings, sd).await;
    }

    async fn on_long_press(&self, e: KeyEvent, _timeout: f32, sd: StreamDeck) {
        let settings: LoadoutSettings = get_settings(e.payload.settings);
        self.equip_loadout(sd, e.context, settings, true).await;
    }

    async fn on_send_to_plugin(&self, e: SendToPluginEvent, sd: StreamDeck) {
        if !e.payload.contains_key("action") {
            return;
        }
        let action = e.payload.get("action").unwrap().as_str().unwrap();
        match action {
            "select" => {
                let mut tmp = SHARED.lock().await;
                tmp.insert("loadout", json!(e.context.clone()));
                let selection = Selection::new("loadout");
                sd.external(with_action("selection", json_string!(&selection)))
                    .await;
            }
            &_ => {}
        }
    }
}
