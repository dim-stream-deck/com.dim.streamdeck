use serde::{Deserialize, Serialize};

pub fn authentication_version() -> String {
    return r#"{ "action": "authorization:version", "version": 2 }"#.to_string();
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Selection {
    selection: String,
}

impl Selection {
    pub fn new(item: &str) -> Self {
        Selection {
            selection: item.to_string(),
        }
    }
}
