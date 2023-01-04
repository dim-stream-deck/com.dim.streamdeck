#![allow(dead_code)]
extern crate lazy_static;

use crate::actions::authorization::AuthorizationAction;
use crate::actions::auto_profile::AutoProfileAction;
use crate::actions::farming_mode::FarmingModeAction;
use crate::actions::loadout::LoadoutAction;
use crate::actions::max_power::MaxPowerAction;
use crate::actions::metrics::MetricsAction;
use stream_deck_sdk::action_manager::ActionManager;
use stream_deck_sdk::{connect, init};
use tokio::select;

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
    let actions_manager = ActionManager::new()
        .register(Box::new(RefreshAction))
        .register(Box::new(OpenDimAction))
        .register(Box::new(SearchAction))
        .register(Box::new(RandomizeAction))
        .register(Box::new(VaultAction))
        .register(Box::new(MetricsAction))
        .register(Box::new(FarmingModeAction))
        .register(Box::new(PullItemAction))
        .register(Box::new(LoadoutAction))
        .register(Box::new(PostmasterAction))
        .register(Box::new(RotationAction))
        .register(Box::new(MaxPowerAction))
        .register(Box::new(AuthorizationAction))
        .register(Box::new(AutoProfileAction));
    let args = init(Some(tx)).await;
    let sd = args.0.clone();
    let stream_deck = connect(args, actions_manager);
    let ws_server = tokio::spawn(server::server(sd, rx));
    select! {
        _ = stream_deck => {},
        _ = ws_server => {}
    }
}
