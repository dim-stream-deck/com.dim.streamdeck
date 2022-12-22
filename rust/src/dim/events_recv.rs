use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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
    pub(crate) total: String,
    pub(crate) base: String,
    pub(crate) artifact: i32,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Vault {
    pub(crate) vault: i32,
    pub(crate) glimmer: i32,
    pub(crate) shards: i32,
    pub(crate) bright_dust: i32,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Postmaster {
    pub(crate) total: i32,
    pub(crate) ascendant_shards: i32,
    pub(crate) enhancement_prisms: i32,
    pub(crate) spoils: i32,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Metrics {
    pub(crate) vanguard: i32,
    pub(crate) gambit: i32,
    pub(crate) crucible: i32,
    pub(crate) trials: i32,
    pub(crate) iron_banner: i32,
    pub(crate) gunsmith: i32,
    pub(crate) triumphs: i32,
    pub(crate) triumphs_active: Option<i32>,
    pub(crate) battle_pass: i32,
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

#[derive(Serialize, Deserialize, Debug)]
pub struct SelectionItem {
    pub(crate) item: String,
    pub(crate) label: String,
    pub(crate) subtitle: String,
    pub(crate) icon: Option<String>,
    pub(crate) element: Option<String>,
    pub(crate) overlay: Option<String>,
    pub(crate) inventory: bool,
    #[serde(rename = "isExotic")]
    pub(crate) is_exotic: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SelectionLoadout {
    pub(crate) loadout: String,
    pub(crate) label: String,
    pub(crate) subtitle: Option<String>,
    pub(crate) icon: Option<String>,
    pub(crate) character: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SelectionLoadoutData {
    pub(crate) selection: SelectionLoadout,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SelectionItemData {
    pub(crate) selection: SelectionItem,
}

#[derive(Serialize, Deserialize, Debug)]
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
    pub(crate) equipped: bool,
    pub(crate) element: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct ItemUpdate {
    pub(crate) data: ItemUpdateData,
}

#[derive(Deserialize, Debug)]
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
