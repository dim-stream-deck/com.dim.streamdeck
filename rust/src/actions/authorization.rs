use async_trait::async_trait;
use serde::Serialize;
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::received::SendToPluginEvent;
use stream_deck_sdk::stream_deck::StreamDeck;

use crate::dim::with_action;
use crate::json_string;

pub struct AuthorizationAction;

#[derive(Serialize)]
pub struct AuthorizationItem {
    id: String,
    code: String,
}

#[async_trait]
impl Action for AuthorizationAction {
    fn uuid(&self) -> &str {
        "shared"
    }

    async fn on_send_to_plugin(&self, e: SendToPluginEvent, sd: StreamDeck) {
        if !e.payload.contains_key("authorization") {
            return;
        }
        sd.external(with_action(
            "authorization",
            json_string!(&AuthorizationItem {
                id: e
                    .payload
                    .get("authorization")
                    .unwrap()
                    .as_str()
                    .unwrap()
                    .to_string(),
                code: e.payload.get("code").unwrap().as_str().unwrap().to_string()
            }),
        ))
        .await;
    }
}
