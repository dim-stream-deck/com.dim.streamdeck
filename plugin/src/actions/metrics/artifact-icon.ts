import { Cache } from "@/util/cache";
import { CanvasKit } from "@/util/canvas";
import { shadow } from "@/util/images";

export const ArtifactIcon = async (url: string) => {
  const image = await Cache.imageFromUrl(url, "arraybuffer");
  if (!image) {
    return;
  }
  const Canvas = await CanvasKit;
  const canvas = Canvas.MakeCanvas(72, 72);
  const ctx = canvas.getContext("2d");
  const image2 = Canvas.MakeImageFromEncoded(image);
  const shadowImage = Canvas.MakeImageFromEncoded(shadow);
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, 72, 72);
  ctx.drawImage(image2, 0, 0, 72, 72);
  ctx.drawImage(shadowImage, 0, 0, 72, 72);
  const data = canvas.toDataURL();
  return data;
};
