import { cache } from "@/util/cache";
import { withCanvas, CanvasKit } from "@/util/canvas";
import { bungify, shadow } from "@/util/images";
import { downloadAsArrayBuffer } from "@/lib/image";

export const ArtifactIcon = async (url: string) => {
  const cacheKey = [url];

  // Check if the image is already cached
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Generate the image
  const source = await downloadAsArrayBuffer(bungify(url));
  if (!source) return "";
  const Canvas = await CanvasKit;
  return withCanvas(Canvas, 72, 72, async (canvas, decode) => {
    const ctx = canvas.getContext("2d");
    const image = decode(source);
    const shadowImage = decode(shadow);
    ctx.drawImage(image, 0, 0, 72, 72);
    ctx.drawImage(shadowImage, 0, 0, 72, 72);

    // Cache the image
    const data = canvas.toDataURL();
    cache.set(cacheKey, data);
    return data;
  });
};
