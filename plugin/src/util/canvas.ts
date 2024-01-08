import CanvasKitInit, {
  EmulatedCanvas2DContext,
  Image,
} from "canvaskit-wasm/bin/canvaskit.js";
import { Cache } from "./cache";
import { splitEvery } from "ramda";

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

export const grayscale = (ctx: EmulatedCanvas2DContext) => {
  const imageData = ctx.getImageData(0, 0, 144, 144);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg; // red
    data[i + 1] = avg; // green
    data[i + 2] = avg; // blue
  }
  ctx.putImageData(imageData, 0, 0);
};

export const splitTitle = (text?: string) =>
  text ? splitEvery(6, text).join("\n") : undefined;
