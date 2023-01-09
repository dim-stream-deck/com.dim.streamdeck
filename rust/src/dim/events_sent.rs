use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Selection {
    pub selection: String,
}

impl Selection {
    pub fn new(item: &str) -> Self {
        Selection {
            selection: item.to_string(),
        }
    }
}
