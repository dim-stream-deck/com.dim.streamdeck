import { cache } from "@/util/cache";
import { CanvasKit } from "@/util/canvas";
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
  const canvas = Canvas.MakeCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const icon = Canvas.MakeImageFromEncoded(iconSource);
  const bg = Canvas.MakeImageFromEncoded(bgSource);
  ctx.drawImage(bg, 0, 0, size, size);
  ctx.drawImage(icon, 0, 0, size, size);

  // Cache the image
  const image = canvas.toDataURL();
  cache.set(cacheKey, image);
  return image;
};
