use async_trait::async_trait;
use runas::Command;
use serde_json::Value;
use std::collections::HashMap;
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::events::{AppearEvent, KeyEvent, SendToPluginEvent};
use stream_deck_sdk::images::image_to_base64;
use stream_deck_sdk::stream_deck::StreamDeck;
use tungstenite::http::{Method, Request};
use warp::hyper;
use warp::hyper::{body, Client};

use crate::shared::{SOLO_MODE_OFF, SOLO_MODE_ON};

pub struct SoloModeAction;

async fn action_on_service(action: &str) -> Option<bool> {
    let client = Client::new();
    let request = Request::builder()
        .method(Method::GET)
        .uri(format!("http://localhost:9121?action={}", action));
    let req = request.body::<hyper::Body>(hyper::Body::empty()).unwrap();
    let res = client.request(req).await;
    if res.is_ok() {
        let mut res = res.unwrap();
        if res.status().is_success() {
            let body = res.body_mut();
            let bytes = body::to_bytes(body).await.unwrap();
            return Some(String::from_utf8(bytes.to_vec()).unwrap() == "true");
        }
    }
    return None;
}

impl SoloModeAction {
    async fn update_tile(&self, status: Option<bool>, context: String, sd: StreamDeck) {
        match status {
            Some(enabled) => {
                let image = if enabled {
                    SOLO_MODE_ON.to_vec()
                } else {
                    SOLO_MODE_OFF.to_vec()
                };
                sd.set_image_b64(context, Some(image_to_base64(image)))
                    .await
            }
            _ => sd.show_alert(context).await,
        }
    }
}

#[cfg(windows)]
fn service_management(action: &str) -> Option<bool> {
    let binary = if action == "remove-service" {
        "remove-sd-solo-enabler.exe"
    } else {
        "install-sd-solo-enabler.exe"
    };
    let status = Command::new(format!("solo-mode\\{}", binary)).status();
    if status.is_ok() {
        if status.unwrap().success() {
            return Some(if action == "remove-service" {
                false
            } else {
                true
            });
        }
    }
    return None;
}

#[cfg(not(windows))]
fn service_management(binary: &str) -> Option<bool> {
    return None;
}

#[async_trait]
impl Action for SoloModeAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.solo-mode"
    }

    async fn on_appear(&self, e: AppearEvent, sd: StreamDeck) {
        self.update_tile(action_on_service("status").await, e.context, sd)
            .await;
    }

    async fn on_key_down(&self, e: KeyEvent, sd: StreamDeck) {
        self.update_tile(action_on_service("toggle").await, e.context, sd)
            .await;
    }

    async fn on_send_to_plugin(&self, e: SendToPluginEvent, sd: StreamDeck) {
        let action = e.payload.get("action");
        match action {
            Some(action) => {
                let res = service_management(action.as_str().unwrap());
                if res.is_some() {
                    let mut changes: HashMap<String, Value> = HashMap::default();
                    changes.insert("enabledSoloService".to_string(), Value::Bool(res.unwrap()));
                    sd.update_global_settings(changes, Some(true)).await;
                } else {
                    sd.show_alert(e.context).await;
                }
            }
            _ => {}
        }
    }
}
