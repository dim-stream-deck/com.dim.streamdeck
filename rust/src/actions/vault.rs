extern crate separator;

use async_trait::async_trait;
use separator::Separatable;
use serde::{Deserialize, Serialize};
use skia_safe::Point;
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::events::{
    AppearEvent, DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent,
};
use stream_deck_sdk::get_settings;
use stream_deck_sdk::stream_deck::StreamDeck;

use crate::dim::events_recv::Vault;
use crate::util::{auto_margin, prepare_render, prepare_text, surface_to_b64};

pub struct VaultAction;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
enum ItemType {
    Vault,
    Glimmer,
    Dust,
    BrightDust,
    Shards,
}

#[derive(Serialize, Deserialize, Debug)]
struct VaultSettings {
    pub(crate) item: Option<ItemType>,
}

#[derive(Deserialize, Debug)]
struct PartialPluginSettings {
    pub(crate) vault: Option<Vault>,
}

fn render_action(item: ItemType, counter: String) -> String {
    let file_image = match item {
        ItemType::BrightDust => "./images/vault/dust.png".to_string(),
        _ => format!("./images/vault/{:?}.png", item).to_string(),
    };

    let (mut surface, paint, typeface) = prepare_render(file_image, 144);
    let (label, (w, _)) = prepare_text(&counter, &typeface, 28.0);

    surface
        .canvas()
        .draw_text_blob(label, Point::new(auto_margin(w), 124.0), &paint);

    surface_to_b64(surface)
}

impl VaultAction {
    async fn update(&self, context: String, sd: StreamDeck, settings: Option<VaultSettings>) {
        let global: Option<PartialPluginSettings> = sd.global_settings().await;

        if settings.is_none() || global.is_none() {
            return;
        }

        if let Some(vault) = global.unwrap().vault {
            let settings = settings.unwrap();
            let item = settings.item.unwrap_or(ItemType::Vault);
            let counter = match item {
                ItemType::Vault => vault.vault,
                ItemType::Glimmer => vault.glimmer,
                ItemType::Dust => vault.bright_dust,
                ItemType::BrightDust => vault.bright_dust,
                ItemType::Shards => vault.shards,
            };
            if counter.is_none() {
                return;
            }
            let image = render_action(item, counter.unwrap().separated_string());
            sd.set_image_b64(context, Some(image)).await;
        }
    }
}

#[async_trait]
impl Action for VaultAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.vault"
    }

    async fn on_appear(&self, e: AppearEvent, sd: StreamDeck) {
        let settings: Option<VaultSettings> = get_settings(e.payload.settings);
        self.update(e.context, sd, settings).await;
    }

    async fn on_settings_changed(&self, e: DidReceiveSettingsEvent, sd: StreamDeck) {
        let settings: Option<VaultSettings> = get_settings(e.payload.settings);
        self.update(e.context, sd, settings).await;
    }

    async fn on_global_settings_changed(&self, _e: DidReceiveGlobalSettingsEvent, sd: StreamDeck) {
        let instances = sd.contexts_of(self.uuid()).await;
        for ctx in instances {
            let settings: Option<VaultSettings> = sd.settings(ctx.clone()).await;
            self.update(ctx.clone(), sd.clone(), settings).await
        }
    }
}
