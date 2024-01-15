import { Cache } from "@/util/cache";
import { downloadAsArrayBuffer, toBase64 } from "@/util/images";

export const ImageIcon = async (icon: string) => {
  const key = [icon];
  if (Cache.has(key)) return Cache.get(key);
  const res = await downloadAsArrayBuffer(icon);
  const image = toBase64(res, "image/png");
  Cache.set(key, image);
  return image;
};
