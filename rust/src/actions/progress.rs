use crate::actions::search::SearchSettings;
use crate::dim::events_sent::Selection;
use crate::dim::with_action;
use crate::json_string;
use crate::shared::SHARED;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::json;
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::events::{AppearEvent, SendToPluginEvent};
use stream_deck_sdk::get_settings;
use stream_deck_sdk::stream_deck::StreamDeck;

pub struct ProgressAction;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProgressSettings {
    pub(crate) item: Option<String>,
    pub(crate) label: Option<String>,
    pub(crate) subtitle: Option<String>,
    pub(crate) icon: Option<String>,
    pub(crate) progress_type: Option<String>,
    pub(crate) overlay: Option<String>,
    pub(crate) is_exotic: Option<bool>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FetchProgress {
    pub id: String,
    pub fetch_type: String,
}

#[async_trait]
impl Action for ProgressAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.progress"
    }

    async fn on_appear(&self, e: AppearEvent, sd: StreamDeck) {
        let settings = get_settings::<ProgressSettings>(e.payload.settings);
        if settings.item.is_some() {
            let mut tmp = SHARED.lock().await;
            tmp.insert(settings.item.clone().unwrap(), json!(e.context.clone()));
            sd.external(with_action(
                "fetchProgress",
                serde_json::to_string(&FetchProgress {
                    id: settings.item.unwrap(),
                    fetch_type: settings.progress_type.unwrap(),
                })
                .unwrap(),
            ))
            .await;
        }
    }

    async fn on_send_to_plugin(&self, e: SendToPluginEvent, sd: StreamDeck) {
        if !e.payload.contains_key("action") {
            return;
        }
        let action = e.payload.get("action").unwrap().as_str().unwrap();
        let id = e.payload.get("id");
        match action {
            "select" => {
                let selection_type = e.payload.get("type").unwrap().as_str().unwrap().to_string();
                let mut tmp = SHARED.lock().await;
                tmp.insert(selection_type.clone(), json!(e.context.clone()));
                let selection = Selection::new(selection_type.as_str());
                sd.external(with_action("selection", json_string!(&selection)))
                    .await;
            }
            "show" => {
                let search_field = format!("id:{}", id.unwrap().to_string());
                let search = SearchSettings::new(search_field);
                sd.external(with_action("search", json_string!(&search)))
                    .await;
            }
            &_ => unreachable!(),
        }
    }
}
