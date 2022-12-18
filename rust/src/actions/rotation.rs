use async_trait::async_trait;
use stream_deck_sdk::action::Action;

pub struct RotationAction;

#[async_trait]
impl Action for RotationAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.rotation"
    }
}
