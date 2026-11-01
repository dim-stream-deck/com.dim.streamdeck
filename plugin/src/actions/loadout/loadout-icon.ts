import { cache } from "@/util/cache";
import { withCanvas, CanvasKit } from "@/util/canvas";
import { bungify } from "@/util/images";
import { downloadAsArrayBuffer } from "@/lib/image";

interface IconDefinition {
  icon: string;
  background: string;
}

const size = 96;

export const LoadoutIcon = async (def: IconDefinition) => {
  const cacheKey = [def.icon, def.background];

  // Check the cache
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Generate the image
  const iconSource = await downloadAsArrayBuffer(bungify(def.icon));
  const bgSource = await downloadAsArrayBuffer(bungify(def.background));
  if (!iconSource || !bgSource) {
    return;
  }
  const Canvas = await CanvasKit;
  return withCanvas(Canvas, size, size, async (canvas, decode) => {
    const ctx = canvas.getContext("2d");
    const icon = decode(iconSource);
    const bg = decode(bgSource);
    ctx.drawImage(bg, 0, 0, size, size);
    ctx.drawImage(icon, 0, 0, size, size);

    // Cache the image
    const image = canvas.toDataURL();
    cache.set(cacheKey, image);
    return image;
  });
};
