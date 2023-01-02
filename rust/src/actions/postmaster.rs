use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use skia_safe::Point;
use stream_deck_sdk::action::Action;
use stream_deck_sdk::events::events::{
    AppearEvent, DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent, KeyEvent,
};
use stream_deck_sdk::get_settings;
use stream_deck_sdk::stream_deck::StreamDeck;

use crate::dim::events_recv::Postmaster;
use crate::dim::with_action;
use crate::util::{auto_margin, init_canvas, prepare_text, surface_to_b64};

pub struct PostmasterAction;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PostmasterSettings {
    pub(crate) style: Option<String>,
    pub(crate) postmaster_item: Option<String>,
    pub(crate) collect_postmaster: Option<bool>,
}

#[derive(Deserialize, Debug)]
struct PartialPluginSettings {
    #[serde(rename = "postmaster")]
    pub(crate) postmaster: Option<Postmaster>,
}

async fn render_action(
    item: Option<String>,
    style: Option<String>,
    postmaster: Postmaster,
) -> Option<String> {
    let item = item.unwrap_or_else(|| "".to_string());
    let is_total = item == "";

    let file_image = match is_total {
        true => "./images/postmaster/postmaster.png".to_string(),
        false => format!("./images/postmaster/{}.png", item),
    };

    let is_percentage =
        is_total && style.unwrap_or_else(|| "percentage".to_string()) == "percentage".to_string();

    let mut value = match item.as_str() {
        "spoils" => postmaster.spoils,
        "ascendantShards" => postmaster.ascendant_shards,
        "enhancementPrisms" => postmaster.enhancement_prisms,
        _ => match is_percentage {
            true => ((postmaster.total as f32 / 21.0) * 100.0).ceil() as i32,
            false => postmaster.total,
        },
    }
    .to_string();

    if is_percentage {
        value = value + "%";
    }

    let (mut surface, paint, typeface) = init_canvas(Some(file_image), None, 144);

    let (label, (w, _)) = prepare_text(&value, &typeface, 28.0);

    let y = match is_total {
        true => 84.0,
        false => 128.0,
    };

    surface
        .canvas()
        .draw_text_blob(label, Point::new(auto_margin(w), y), &paint);

    Some(surface_to_b64(surface))
}

impl PostmasterAction {
    async fn update(&self, context: String, sd: StreamDeck) {
        let postmaster = sd
            .global_settings::<PartialPluginSettings>()
            .await
            .postmaster;

        if postmaster.is_none() {
            return;
        }

        let settings: Option<PostmasterSettings> = sd.settings(context.clone()).await;

        if let Some(settings) = settings {
            let image = render_action(
                settings.postmaster_item,
                settings.style,
                postmaster.unwrap(),
            )
            .await;
            if image.is_some() {
                sd.set_image_b64(context, image).await;
            }
        }
    }
}

#[async_trait]
impl Action for PostmasterAction {
    fn uuid(&self) -> &str {
        "com.dim.streamdeck.postmaster"
    }

    async fn on_appear(&self, e: AppearEvent, sd: StreamDeck) {
        self.update(e.context, sd).await;
    }

    async fn on_key_down(&self, e: KeyEvent, sd: StreamDeck) {
        let settings: PostmasterSettings = get_settings(e.payload.settings);
        if settings.postmaster_item == Some("".to_string())
            && settings.collect_postmaster == Some(true)
        {
            sd.external(with_action("collectPostmaster", String::new()))
                .await;
            sd.show_ok(e.context).await;
            return;
        }
    }

    async fn on_settings_changed(&self, e: DidReceiveSettingsEvent, sd: StreamDeck) {
        self.update(e.context, sd).await;
    }

    async fn on_global_settings_changed(&self, _e: DidReceiveGlobalSettingsEvent, sd: StreamDeck) {
        let instances = sd.contexts_of(self.uuid()).await;
        for ctx in instances {
            self.update(ctx, sd.clone()).await;
        }
    }
}
