extern crate separator;

use async_trait::async_trait;
use separator::Separatable;
use serde::{Deserialize, Serialize};
use skia_safe::Point;
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::received::{
    AppearEvent, DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent,
};
use stream_deck_sdk::get_settings;
use stream_deck_sdk::stream_deck::StreamDeck;

use crate::dim::events_recv::Vault;
use crate::util::{auto_margin, prepare_render, prepare_text, surface_to_b64};

pub struct VaultAction;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
enum ItemType {
    Vault,
    Glimmer,
    Dust,
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
    let file_image = format!("./images/vault/{:?}.png", item);
    let (mut surface, paint, typeface) = prepare_render(file_image, 144);
    let (label, (w, _)) = prepare_text(&counter, &typeface, 28.0);

    surface
        .canvas()
        .draw_text_blob(label, Point::new(auto_margin(w), 124.0), &paint);

    surface_to_b64(surface)
}

impl VaultAction {
    async fn update(&self, context: String, sd: StreamDeck, settings: Option<VaultSettings>) {
        let vault = sd.global_settings::<PartialPluginSettings>().await.vault;

        if settings.is_none() || vault.is_none() {
            return;
        }

        let vault = vault.unwrap();
        let settings = settings.unwrap();
        let item = settings.item.unwrap_or(ItemType::Vault);

        let counter = match item {
            ItemType::Vault => vault.vault,
            ItemType::Glimmer => vault.glimmer,
            ItemType::Dust => vault.bright_dust,
            ItemType::Shards => vault.shards,
        };

        let image = render_action(item, counter.separated_string());
        sd.set_image_b64(context, Some(image)).await;
    }
}

#[async_trait]
impl Action for VaultAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.vault"
    }

    async fn on_appear(&self, e: AppearEvent, sd: StreamDeck) {
        let settings: VaultSettings = get_settings(e.payload.settings);
        self.update(e.context, sd, Some(settings)).await;
    }

    async fn on_settings_changed(&self, e: DidReceiveSettingsEvent, sd: StreamDeck) {
        let settings: VaultSettings = get_settings(e.payload.settings);
        self.update(e.context, sd, Some(settings)).await;
    }

    async fn on_global_settings_changed(&self, _e: DidReceiveGlobalSettingsEvent, sd: StreamDeck) {
        let instances = sd.contexts_of(self.uuid()).await;
        for ctx in instances {
            let settings: Option<VaultSettings> = sd.settings(ctx.clone()).await;
            self.update(ctx.clone(), sd.clone(), settings).await
        }
    }
}
