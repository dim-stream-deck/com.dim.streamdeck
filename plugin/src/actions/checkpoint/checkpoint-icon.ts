import { cache } from "@/util/cache";
import { CanvasKit, grayscale } from "@/util/canvas";
import { downloadAsArrayBuffer } from "@/lib/image";

export const CheckpointIcon = async (iconUrl: string, enabled: boolean) => {
  const cacheKey = [iconUrl, enabled];

  // Check if the image is already cached
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Generate the image
  const source = await downloadAsArrayBuffer(iconUrl);
  if (!source) return "";
  const Canvas = await CanvasKit;
  const canvas = Canvas.MakeCanvas(144, 144);
  const ctx = canvas.getContext("2d");
  const base = Canvas.MakeImageFromEncoded(source);

  if (base) {
    ctx.drawImage(
      base,
      (base.width() - base.height()) / 2,
      0,
      base.height(),
      base.height(),
      0,
      0,
      144,
      144
    );
  }

  // if checkpoint is not available, grayscale the image
  if (!enabled) {
    grayscale(ctx);
  }

  // Cache the image
  const image = canvas.toDataURL();
  cache.set(cacheKey, image);
  return image;
};
