use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::dim::events_recv::{MaxPower, Postmaster, Vault};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PluginSettings {
    pub(crate) tokens: Option<HashMap<String, String>>,
    postmaster: Option<Postmaster>,
    max_power: Option<MaxPower>,
    vault: Option<Vault>,
    farming_mode: Option<bool>,
}
