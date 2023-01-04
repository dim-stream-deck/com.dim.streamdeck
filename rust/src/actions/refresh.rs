use crate::dim::with_action;
use async_trait::async_trait;
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::events::KeyEvent;
use stream_deck_sdk::stream_deck::StreamDeck;

pub struct RefreshAction;

#[async_trait]
impl Action for RefreshAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.refresh"
    }

    async fn on_key_down(&self, _e: KeyEvent, sd: StreamDeck) {
        sd.external(with_action("refresh", String::new())).await;
    }

    async fn on_key_up(&self, e: KeyEvent, sd: StreamDeck) {
        sd.show_ok(e.context).await;
    }
}
