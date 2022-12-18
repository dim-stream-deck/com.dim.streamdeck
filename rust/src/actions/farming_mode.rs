use async_trait::async_trait;
use serde::Deserialize;
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::received::{AppearEvent, DidReceiveGlobalSettingsEvent, KeyEvent};
use stream_deck_sdk::stream_deck::StreamDeck;

use crate::dim::with_action;

pub struct FarmingModeAction;

#[derive(Deserialize, Debug)]
struct PartialPluginSettings {
    #[serde(rename = "farmingMode")]
    pub(crate) farming_mode: Option<bool>,
}

impl FarmingModeAction {
    async fn update(&self, context: String, sd: StreamDeck, farming_mode: Option<bool>) {
        let state = match farming_mode {
            Some(true) => 1,
            Some(false) => 0,
            None => return,
        };
        sd.set_state(context, state).await;
    }
}

#[async_trait]
impl Action for FarmingModeAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.farming-mode"
    }

    async fn on_appear(&self, e: AppearEvent, sd: StreamDeck) {
        let settings = sd
            .global_settings::<PartialPluginSettings>()
            .await
            .farming_mode;
        self.update(e.context, sd, settings).await;
    }

    async fn on_key_up(&self, _e: KeyEvent, sd: StreamDeck) {
        sd.external(with_action("farmingMode", String::new())).await;
    }

    async fn on_global_settings_changed(&self, _e: DidReceiveGlobalSettingsEvent, sd: StreamDeck) {
        let contexts = sd.contexts_of(self.uuid()).await;
        for ctx in contexts {
            let settings = sd
                .global_settings::<PartialPluginSettings>()
                .await
                .farming_mode;
            self.update(ctx.clone(), sd.clone(), settings).await;
        }
    }
}
