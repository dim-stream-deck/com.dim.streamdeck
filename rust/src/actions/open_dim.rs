use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::received::KeyEvent;
use stream_deck_sdk::get_settings;
use stream_deck_sdk::stream_deck::StreamDeck;

pub struct OpenDimAction;

#[derive(Serialize, Deserialize, Debug)]
struct OpenDimSettings {
    pub(crate) beta: Option<bool>,
}

#[async_trait]
impl Action for OpenDimAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.app"
    }

    async fn on_key_down(&self, e: KeyEvent, _sd: StreamDeck) {
        let settings = get_settings::<OpenDimSettings>(e.payload.settings);
        let beta = settings.beta.unwrap_or(false);
        let prefix = match beta {
            true => "beta",
            false => "app",
        };
        open::that(format!("https://{}.destinyitemmanager.com", prefix)).unwrap();
    }

    async fn on_key_up(&self, e: KeyEvent, sd: StreamDeck) {
        sd.show_ok(e.context).await;
    }
}
