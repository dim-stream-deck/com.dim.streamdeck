use async_trait::async_trait;
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::events::KeyEvent;
use stream_deck_sdk::stream_deck::StreamDeck;

pub struct AutoProfileAction;

#[async_trait]
impl Action for AutoProfileAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.page"
    }
    async fn on_key_down(&self, _e: KeyEvent, _sd: StreamDeck) {}
    async fn on_key_up(&self, _e: KeyEvent, _sd: StreamDeck) {}
}
