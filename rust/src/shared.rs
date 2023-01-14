use std::collections::{HashMap, HashSet};

use lazy_static::lazy_static;
use skia_safe::{ColorMatrix, Rect};
use tokio::sync::Mutex;

use crate::util::get_file_as_byte_vec;

lazy_static! {
    pub static ref SHARED: Mutex<HashMap<String, serde_json::Value>> = {
        let m = HashMap::new();
        Mutex::new(m)
    };
    pub static ref EQUIPPED: Mutex<HashSet<String>> = {
        let m = HashSet::new();
        Mutex::new(m)
    };
    pub static ref MISSING: Mutex<HashSet<String>> = {
        let m = HashSet::new();
        Mutex::new(m)
    };
    pub static ref TILE: Rect = Rect::new(0.0, 0.0, 144.0, 144.0);
    pub static ref GRAYSCALE: ColorMatrix = ColorMatrix::new(
        0.21, 0.72, 0.07, 0.0, 0.0, 0.21, 0.72, 0.07, 0.0, 0.0, 0.21, 0.72, 0.07, 0.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
    );
    pub static ref SHADOW: Vec<u8> = get_file_as_byte_vec("./images/shadow.png");
    pub static ref EXOTIC: Vec<u8> = get_file_as_byte_vec("./images/item/exotic.png");
    pub static ref EQUIPPED_MARK: Vec<u8> = get_file_as_byte_vec("./images/item/equipped-mark.png");
    pub static ref LEGENDARY: Vec<u8> = get_file_as_byte_vec("./images/item/legendary.png");
    pub static ref SOLO_MODE_OFF: Vec<u8> = get_file_as_byte_vec("./images/solo-mode/off.png");
    pub static ref SOLO_MODE_ON: Vec<u8> = get_file_as_byte_vec("./images/solo-mode/on.png");
}

pub async fn has_equipped_items(id: String) -> bool {
    EQUIPPED.lock().await.contains(&id)
}
