use std::fs;
use std::fs::File;
use std::io::Read;

use skia_safe::{
    Color, Data, EncodedImageFormat, Font, Image, Paint, Rect, scalar, Surface, TextBlob, Typeface,
};
use stream_deck_sdk::download::download_image;
use stream_deck_sdk::images::image_to_base64;

use crate::shared::TILE;

pub fn get_file_as_byte_vec(filename: &str) -> Vec<u8> {
    let mut f = File::open(&filename).expect("no file found");
    let metadata = fs::metadata(&filename).expect("unable to read metadata");
    let mut buffer = vec![0; metadata.len() as usize];
    f.read(&mut buffer).expect("buffer overflow");
    buffer
}

pub fn prepare_render(file_image: String, size: i32) -> (Surface, Paint, Typeface) {
    init_canvas(Some(file_image), None, size)
}

pub fn prepare_render_bytes(bytes: Vec<u8>, size: i32) -> (Surface, Paint, Typeface) {
    init_canvas(None, Some(bytes), size)
}

pub fn prepare_render_empty(size: i32) -> (Surface, Paint, Typeface) {
    init_canvas(None, None, size)
}

pub fn bytes_to_skia_image(bytes: Vec<u8>) -> Image {
    Image::from_encoded(Data::new_copy(&bytes)).expect("failed to decode")
}

pub fn init_canvas(
    file_image: Option<String>,
    bytes: Option<Vec<u8>>,
    size: i32,
) -> (Surface, Paint, Typeface) {
    let image: Option<Vec<u8>> = match file_image {
        Some(file_image) => Some(get_file_as_byte_vec(&file_image)),
        None => match bytes {
            Some(bytes) => Some(bytes),
            None => None,
        },
    };

    let ttf = get_file_as_byte_vec(&"./GothamBold.ttf".to_string());
    let gotham = Typeface::from_data(&Data::new_copy(&ttf), 0).unwrap();

    let mut surface = Surface::new_raster_n32_premul((size, size)).expect("no surface!");
    let mut text_paint = Paint::default();
    let paint = Paint::default();

    text_paint
        .set_anti_alias(true)
        .set_color(Color::from_rgb(255, 255, 255));

    if let Some(image) = image {
        surface.canvas().draw_image_rect(
            bytes_to_skia_image(image),
            None,
            Rect {
                left: 0.0,
                top: 0.0,
                right: size as f32,
                bottom: size as f32,
            },
            &paint,
        );
    }

    (surface, text_paint, gotham)
}

pub fn surface_to_b64(mut surface: Surface) -> String {
    let rendered = surface
        .image_snapshot()
        .encode_to_data(EncodedImageFormat::PNG)
        .unwrap()
        .to_vec();
    image_to_base64(rendered)
}

pub fn prepare_text(text: &str, typeface: &Typeface, size: f32) -> (TextBlob, (scalar, scalar)) {
    let font = Font::from_typeface_with_params(typeface, size, 1.0, 0.0);
    let blob = TextBlob::from_str(text, &font).unwrap();
    let (_, size) = font.measure_str(text, None);
    (blob, (size.width(), size.height()))
}

pub fn auto_margin(w: f32) -> f32 {
    (TILE.width() - w) / 2.0
}

pub fn bungify(image: Option<String>) -> Option<String> {
    match image {
        None => None,
        Some(image) => Some(format!("https://www.bungie.net{}", image)),
    }
}

#[macro_export]
macro_rules! json_string {
    ($data:expr) => {
        serde_json::to_string($data).unwrap()
    };
}

pub async fn download_or_cache(url: Option<String>) -> Option<Vec<u8>> {
    if url.is_none() {
        return None;
    }
    let url = url.unwrap();
    let data = cacache::read("./cache", url.clone()).await;
    if data.is_ok() {
        return Some(data.unwrap());
    }
    let res = download_image(url.clone(), None).await;
    if res.is_some() {
        let data = res.unwrap();
        let _ = cacache::write("./cache", url, data.clone()).await;
        Some(data)
    } else {
        None
    }
}
