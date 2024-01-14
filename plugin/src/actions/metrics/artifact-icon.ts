import { Cache } from "@/util/cache";
import { CanvasKit } from "@/util/canvas";
import { downloadAsArrayBuffer, shadow } from "@/util/images";

export const ArtifactIcon = async (url: string) => {
  const cacheKey = [url];

  // Check if the image is already cached
  if (Cache.has(cacheKey)) {
    return Cache.get(cacheKey);
  }

  // Generate the image
  const source = await downloadAsArrayBuffer(url);
  if (!source) return "";
  const Canvas = await CanvasKit;
  const canvas = Canvas.MakeCanvas(72, 72);
  const ctx = canvas.getContext("2d");
  const image = Canvas.MakeImageFromEncoded(source);
  const shadowImage = Canvas.MakeImageFromEncoded(shadow);
  ctx.drawImage(image, 0, 0, 72, 72);
  ctx.drawImage(shadowImage, 0, 0, 72, 72);

  // Cache the image
  const data = canvas.toDataURL();
  Cache.set(cacheKey, data);
  return data;
};
