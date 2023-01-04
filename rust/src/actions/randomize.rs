use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::events::KeyEvent;
use stream_deck_sdk::get_settings;
use stream_deck_sdk::stream_deck::StreamDeck;

use crate::dim::with_action;

pub struct RandomizeAction;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RandomizeSettings {
    pub(crate) weapons_only: Option<bool>,
}

#[async_trait]
impl Action for RandomizeAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.randomize"
    }

    async fn on_key_down(&self, e: KeyEvent, sd: StreamDeck) {
        let settings = get_settings::<RandomizeSettings>(e.payload.settings);
        sd.external(with_action(
            "randomize",
            serde_json::to_string(&settings).unwrap(),
        ))
        .await
    }

    async fn on_key_up(&self, e: KeyEvent, sd: StreamDeck) {
        sd.show_ok(e.context).await;
    }
}
