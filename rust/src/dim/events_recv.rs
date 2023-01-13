use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum ToDimAction {
    Search,
    Randomize,
    CollectPostmaster,
    Refresh,
    FarmingMode,
    MaxPower,
    PullItem,
    Selection,
    Loadout,
    FreeBucketSlot,
    #[serde(rename = "pullItem:items-request")]
    PullItemItemsRequest,
    #[serde(rename = "authorization:init")]
    AuthorizationInit,
    #[serde(rename = "authorization:confirm")]
    AuthorizationConfirm,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
pub enum StreamDeckSelectionType {
    Loadout,
    Item,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MaxPower {
    pub(crate) total: Option<String>,
    pub(crate) base: Option<String>,
    pub(crate) artifact: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Vault {
    pub(crate) vault: Option<i32>,
    pub(crate) glimmer: Option<i32>,
    pub(crate) shards: Option<i32>,
    pub(crate) bright_dust: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Postmaster {
    pub(crate) total: Option<i32>,
    pub(crate) ascendant_shards: Option<i32>,
    pub(crate) enhancement_prisms: Option<i32>,
    pub(crate) spoils: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Metrics {
    pub(crate) vanguard: Option<i32>,
    pub(crate) gambit: Option<i32>,
    pub(crate) crucible: Option<i32>,
    pub(crate) trials: Option<i32>,
    pub(crate) iron_banner: Option<i32>,
    pub(crate) gunsmith: Option<i32>,
    pub(crate) triumphs: Option<i32>,
    pub(crate) triumphs_active: Option<i32>,
    pub(crate) battle_pass: Option<i32>,
    pub(crate) artifact_icon: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateData {
    selection_type: Option<StreamDeckSelectionType>,
    farming_mode: Option<bool>,
    max_power: Option<MaxPower>,
    vault: Option<Vault>,
    metrics: Option<Metrics>,
    postmaster: Option<Postmaster>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SelectionItem {
    pub(crate) item: Option<String>,
    pub(crate) label: Option<String>,
    pub(crate) subtitle: Option<String>,
    pub(crate) icon: Option<String>,
    pub(crate) element: Option<String>,
    pub(crate) overlay: Option<String>,
    pub(crate) inventory: Option<bool>,
    #[serde(rename = "isExotic")]
    pub(crate) is_exotic: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SelectionLoadout {
    pub(crate) loadout: Option<String>,
    pub(crate) label: Option<String>,
    pub(crate) subtitle: Option<String>,
    pub(crate) icon: Option<String>,
    pub(crate) character: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SelectionLoadoutData {
    pub(crate) selection: SelectionLoadout,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SelectionItemData {
    pub(crate) selection: SelectionItem,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "selectionType")]
pub enum SelectionMessage {
    #[serde(rename = "loadout")]
    Loadout(SelectionLoadoutData),
    #[serde(rename = "item")]
    Item(SelectionItemData),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateMessage {
    pub(crate) data: HashMap<String, serde_json::Value>,
}

#[derive(Deserialize, Debug)]
pub struct ItemUpdateData {
    pub(crate) context: String,
    pub(crate) equipped: Option<bool>,
    pub(crate) element: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct ItemUpdate {
    pub(crate) data: ItemUpdateData,
}

#[derive(Deserialize, Debug, Clone)]
pub struct SelectionMessageData {
    pub(crate) data: SelectionMessage,
}

#[derive(Deserialize, Debug)]
pub struct AuthorizationMessageData {
    pub(crate) token: String,
}

#[derive(Deserialize, Debug)]
pub struct AuthorizationMessage {
    pub(crate) data: AuthorizationMessageData,
}

#[derive(Deserialize, Debug)]
pub struct EmptyMessage {}

#[derive(Deserialize, Debug)]
#[serde(tag = "action")]
pub enum FromDimMessage {
    #[serde(rename = "dim:update")]
    Update(UpdateMessage),
    #[serde(rename = "dim:item-update")]
    ItemUpdate(ItemUpdate),
    #[serde(rename = "dim:selection")]
    Selection(SelectionMessageData),
    #[serde(rename = "authorization:confirm")]
    AuthorizationConfirm(AuthorizationMessage),
    #[serde(rename = "authorization:reset")]
    AuthorizationReset(EmptyMessage),
}
