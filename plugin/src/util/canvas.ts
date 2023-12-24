import CanvasKitInit, { Image } from "canvaskit-wasm/bin/canvaskit.js";
import { Cache } from "./cache";

export const CanvasKit = CanvasKitInit({
  locateFile: (file) => process.cwd() + "/" + file,
});

const CanvasImages = new Map<string, Image>();

export const loadImage = (
  kit: Awaited<typeof CanvasKit>,
  key: string,
  image: ArrayBuffer
) => {
  if (CanvasImages.has(key)) {
    return CanvasImages.get(key);
  }
  const img = kit.MakeImageFromEncoded(image);
  img && CanvasImages.set(key, img);
  return img;
};

export const loadImageFromUrl = async (
  kit: Awaited<typeof CanvasKit>,
  url: string
) => {
  const image = await Cache.imageFromUrl(url, "arraybuffer");
  if (image) {
    return loadImage(kit, url, image);
  }
};
