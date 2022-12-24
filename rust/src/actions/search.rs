use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::received::{KeyEvent};
use stream_deck_sdk::get_settings;
use stream_deck_sdk::stream_deck::StreamDeck;

use crate::dim::with_action;

pub struct SearchAction;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SearchSettings {
    search: Option<String>,
    page: Option<String>,
    pull_items: Option<bool>,
}

impl SearchSettings {
    pub fn new(search: String) -> Self {
        SearchSettings {
            search: Some(search),
            page: None,
            pull_items: None,
        }
    }
}

#[async_trait]
impl Action for SearchAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.search"
    }

    async fn on_key_down(&self, e: KeyEvent, sd: StreamDeck) {
        let settings = get_settings::<SearchSettings>(e.payload.settings);
        if settings.search.is_some() {
            sd.external(with_action(
                "search",
                serde_json::to_string(&settings).unwrap(),
            )).await;
            sd.show_ok(e.context).await;
        } else {
            sd.show_alert(e.context).await;
        }
    }
}
