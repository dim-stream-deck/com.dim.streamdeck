import { Cache } from "@/util/cache";
import { CanvasKit } from "@/util/canvas";
import { shadow } from "@/util/images";

export const CheckpointIcon = async (url: string) => {
  const source = await Cache.imageFromUrl(url, "arraybuffer");
  if (!source) {
    return;
  }
  const Canvas = await CanvasKit;
  const canvas = Canvas.MakeCanvas(144, 144);
  const ctx = canvas.getContext("2d");
  const image = Canvas.MakeImageFromEncoded(source);
  const shadowImage = Canvas.MakeImageFromEncoded(shadow);
  if (image) {
    ctx.drawImage(
      image,
      (image.width() - image.height()) / 2,
      0,
      image.height(),
      image.height(),
      0,
      0,
      144,
      144
    );
  }
  ctx.drawImage(shadowImage, 0, 0, 144, 144);
  const data = canvas.toDataURL();
  return data;
};
