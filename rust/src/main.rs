#![allow(dead_code)]
extern crate lazy_static;

use stream_deck_sdk::action_manager::ActionManager;
use stream_deck_sdk::init;

use crate::actions::authorization::AuthorizationAction;
use crate::actions::auto_profile::AutoProfileAction;
use crate::actions::farming_mode::FarmingModeAction;
use crate::actions::loadout::LoadoutAction;
use crate::actions::max_power::MaxPowerAction;
use crate::actions::metrics::MetricsAction;
use crate::actions::open_dim::OpenDimAction;
use crate::actions::postmaster::PostmasterAction;
use crate::actions::pull_item::PullItemAction;
use crate::actions::randomize::RandomizeAction;
use crate::actions::refresh::RefreshAction;
use crate::actions::rotation::RotationAction;
use crate::actions::search::SearchAction;
use crate::actions::vault::VaultAction;

mod actions;
mod dim;
mod global_settings;
mod server;
mod shared;
mod util;

#[tokio::main]
async fn main() {
    let (tx, rx) = futures::channel::mpsc::unbounded();
    let actions_manager = ActionManager::new().register(vec![
        Box::new(RefreshAction),
        Box::new(OpenDimAction),
        Box::new(SearchAction),
        Box::new(RandomizeAction),
        Box::new(VaultAction),
        Box::new(MetricsAction),
        Box::new(FarmingModeAction),
        Box::new(PullItemAction),
        Box::new(LoadoutAction),
        Box::new(PostmasterAction),
        Box::new(RotationAction),
        Box::new(MaxPowerAction),
        Box::new(AuthorizationAction),
        Box::new(AutoProfileAction),
    ]);
    let init = init(actions_manager, Some(tx)).await;
    tokio::spawn(server::server(init.stream_deck.clone(), rx));
    init.connect().await;
}
