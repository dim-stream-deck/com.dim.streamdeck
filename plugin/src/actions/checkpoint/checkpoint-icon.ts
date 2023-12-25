import { Cache } from "@/util/cache";
import { CanvasKit, grayscale } from "@/util/canvas";

export const CheckpointIcon = async (url: string, enabled: boolean) => {
  const source = await Cache.imageFromUrl(url, "arraybuffer");
  if (!source) {
    return;
  }
  const Canvas = await CanvasKit;
  const canvas = Canvas.MakeCanvas(144, 144);
  const ctx = canvas.getContext("2d");
  const image = Canvas.MakeImageFromEncoded(source);
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
  // if checkpoint is not available, grayscale the image
  if (!enabled) {
    grayscale(ctx);
  }

  const data = canvas.toDataURL();
  return data;
};
