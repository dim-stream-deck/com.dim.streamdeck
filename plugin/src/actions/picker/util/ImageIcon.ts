import { cache } from "@/util/cache";
import { downloadAsBase64 } from "@fcannizzaro/stream-deck-image";

export const ImageIcon = async (icon: string) => {
  const key = [icon];
  if (cache.has(key)) return cache.get(key);
  const image = await downloadAsBase64(icon);
  if (image) {
    cache.set(key, image);
  }
  return image;
};
