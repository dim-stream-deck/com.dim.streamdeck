import { Cache } from "@/util/cache";
import { CanvasKit } from "@/util/canvas";

interface IconDefinition {
  icon: string;
  background: string;
}

const size = 96;

export const LoadoutIcon = async (def: IconDefinition) => {
  const iconSource = await Cache.imageFromUrl(def.icon, "arraybuffer");
  const bgSource = await Cache.imageFromUrl(def.background, "arraybuffer");
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
  const data = canvas.toDataURL();
  return data;
};
