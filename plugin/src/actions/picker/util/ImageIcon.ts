import { cache } from "@/util/cache";
import { bungify } from "@/util/images";
import { downloadAsBase64 } from "@fcannizzaro/stream-deck-image";

export const ImageIcon = async (icon: string) => {
  const key = [icon];
  if (cache.has(key)) return cache.get(key);
  const image = icon && (await downloadAsBase64(bungify(icon)));
  if (image) {
    cache.set(key, image);
  }
  return image ?? "";
};
