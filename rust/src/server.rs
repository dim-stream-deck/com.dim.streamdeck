use std::collections::HashMap;
use std::sync::Arc;

use futures_channel::mpsc::UnboundedReceiver;
use futures_util::{SinkExt, StreamExt, TryFutureExt};
use serde::Deserialize;
use serde_json::{Map, Value};
use stream_deck_sdk::stream_deck::StreamDeck;
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::Filter;
use warp::path::FullPath;
use warp::ws::{Message, WebSocket};

use crate::actions::pull_item::PullItemSettings;
use crate::dim::events_recv::{FromDimMessage, SelectionMessage};
use crate::shared::{EQUIPPED, MISSING, SHARED};

type Clients = Arc<RwLock<HashMap<String, (Option<String>, mpsc::UnboundedSender<Message>)>>>;

#[derive(Deserialize, Debug)]
struct PartialPluginSettings {
    pub(crate) tokens: Option<HashMap<String, String>>,
}

async fn client_token(id: String, sd: StreamDeck) -> Option<String> {
    let plugin: Option<PartialPluginSettings> = sd.global_settings().await;
    if plugin.is_none() {
        return None;
    }
    return match plugin.unwrap().tokens {
        Some(tokens) => {
            if let Some(token) = tokens.get(&id) {
                return Some(token.to_string());
            }
            return None;
        }
        None => None,
    };
}

pub async fn missing_update(id: String, add: bool) -> HashMap<String, Value> {
    let mut changes: HashMap<String, Value> = HashMap::default();
    let mut missing = MISSING.lock().await;
    if add {
        missing.insert(id);
    } else {
        missing.remove(&id);
    }
    changes.insert(
        "missing".to_string(),
        Value::Array(
            missing
                .iter()
                .map(|s| Value::String(s.to_string()))
                .collect(),
        ),
    );
    changes
}

async fn load_settings(sd: StreamDeck) -> PartialPluginSettings {
    let settings: Option<PartialPluginSettings> = sd.global_settings().await;
    match settings {
        Some(settings) => settings,
        None => PartialPluginSettings {
            tokens: Some(HashMap::default()),
        },
    }
}

async fn client_connected(ws: WebSocket, id: String, clients: Clients, sd: StreamDeck) {
    let token = client_token(id.clone(), sd.clone()).await;

    if token.is_none() {
        let changes = missing_update(id.clone(), true).await;
        sd.update_global_settings(changes, Some(true)).await;
    }

    let (mut ws_tx, mut ws_rx) = ws.split();
    let (tx, rx) = mpsc::unbounded_channel();
    let mut rx = UnboundedReceiverStream::new(rx);

    tokio::task::spawn(async move {
        while let Some(message) = rx.next().await {
            ws_tx
                .send(message)
                .unwrap_or_else(|e| {
                    eprintln!("websocket send error: {}", e);
                })
                .await;
        }
    });

    clients.write().await.insert(id.clone(), (token, tx));

    while let Some(result) = ws_rx.next().await {
        match result {
            Ok(msg) => {
                if msg.is_text() {
                    let message =
                        serde_json::from_str::<FromDimMessage>(msg.to_str().unwrap()).unwrap();

                    match message {
                        FromDimMessage::AuthorizationReset(_) => {
                            let mut changes: HashMap<String, Value> = HashMap::default();
                            let settings = load_settings(sd.clone()).await;
                            let filtered_tokens = Map::from_iter(
                                settings
                                    .tokens
                                    .unwrap_or_default()
                                    .iter()
                                    .map(|(k, v)| (k.to_string(), Value::String(v.to_string())))
                                    .filter(|(k, _)| k != &id),
                            );

                            changes.insert("tokens".to_string(), Value::Object(filtered_tokens));
                            changes.insert(
                                "missing".to_string(),
                                Value::Array(vec![Value::String(id.clone())]),
                            );
                            sd.update_global_settings(changes, Some(true)).await;
                        }

                        FromDimMessage::AuthorizationConfirm(item) => {
                            let settings = load_settings(sd.clone()).await;
                            let mut map =
                                Map::from_iter(
                                    settings.tokens.unwrap_or_default().iter().map(|(k, v)| {
                                        (k.to_string(), Value::String(v.to_string()))
                                    }),
                                );

                            map.insert(id.clone(), Value::String(item.data.token.clone()));

                            let mut changes: HashMap<String, Value> = HashMap::default();
                            changes.insert("tokens".to_string(), Value::Object(map));
                            changes.insert("missing".to_string(), Value::Array(vec![]));

                            // update current token
                            let lock = clients.read().await;
                            let client = lock.clone();
                            let client = client.get(&id).unwrap();
                            drop(lock);

                            clients
                                .write()
                                .await
                                .insert(id.clone(), (Some(item.data.token), client.1.clone()));

                            sd.update_global_settings(changes, Some(true)).await;
                        }
                        FromDimMessage::ItemUpdate(item) => {
                            let data = item.data;

                            let settings: Option<PullItemSettings> =
                                sd.settings(data.context.clone()).await;

                            let mut settings = match settings {
                                Some(settings) => settings,
                                None => {
                                    sd.log("[UPDATE ITEM] No settings found".to_string()).await;
                                    return;
                                }
                            };

                            settings.element = data.element;
                            // Update equip state
                            let mut equipped_items = EQUIPPED.lock().await;
                            let id = settings.item.clone().unwrap();
                            if data.equipped == Some(true) {
                                equipped_items.insert(id);
                            } else {
                                equipped_items.remove(&id);
                            }
                            sd.set_settings(data.context, settings).await;
                        }
                        FromDimMessage::Update(m) => {
                            if m.data.contains_key("equippedItems") {
                                let mut equipped = EQUIPPED.lock().await;
                                let items = m
                                    .data
                                    .get("equippedItems")
                                    .unwrap()
                                    .as_array()
                                    .unwrap()
                                    .clone();
                                equipped.clear();
                                for item in items {
                                    equipped.insert(item.as_str().unwrap().to_string());
                                }
                            }
                            sd.update_global_settings(m.data, Some(true)).await;
                        }
                        FromDimMessage::Selection(selection) => {
                            let key = match selection.data.clone() {
                                SelectionMessage::Loadout(_) => "loadout",
                                SelectionMessage::Item(_) => "item",
                            };
                            let shared = SHARED.lock().await;
                            let context = shared.get(key);
                            if context.is_none() {
                                sd.log(format!("No context found for {}", key)).await;
                                return;
                            }
                            let context = context.unwrap().as_str().unwrap().to_string();
                            match selection.data {
                                SelectionMessage::Loadout(data) => {
                                    sd.set_settings(context, data.selection).await;
                                }
                                SelectionMessage::Item(data) => {
                                    sd.set_settings(context, data.selection).await;
                                }
                            }
                        }
                    }
                }
            }
            Err(_e) => break,
        };
    }

    client_disconnected(id, &clients).await;
}

async fn broadcast(msg: String, clients: &Clients) {
    for (token, tx) in clients.read().await.values() {
        let mut send = msg.clone();
        if token.is_some() {
            send = send
                .replacen("{", r#"{"token": "$token", "#, 1)
                .replace("$token", token.clone().unwrap().as_str());
        }
        tx.send(Message::text(send)).expect("websocket send error");
    }
}

async fn client_disconnected(id: String, clients: &Clients) {
    clients.write().await.remove(&id);
}

pub async fn server(sd: StreamDeck, mut rx: UnboundedReceiver<String>) {
    let clients = Clients::default();
    let cloned_clients = clients.clone();
    let mapped_clients = warp::any().map(move || clients.clone());

    tokio::spawn(async move {
        loop {
            let msg = rx.next().await.unwrap();
            broadcast(msg, &cloned_clients.clone()).await;
        }
    });

    let ws = warp::any()
        .and(warp::ws())
        .and(mapped_clients)
        .and(warp::path::full())
        .and(warp::any().map(move || sd.clone()))
        .map(
            |ws: warp::ws::Ws, clients: Clients, path: FullPath, sd: StreamDeck| {
                ws.on_upgrade(move |socket| {
                    let path = path.as_str();
                    let mut iter = path.chars();
                    iter.by_ref().nth(0);
                    client_connected(socket, iter.as_str().to_string(), clients, sd)
                })
            },
        );

    warp::serve(ws).run(([127, 0, 0, 1], 9120)).await;
}
