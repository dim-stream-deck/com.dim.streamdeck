import { Cache } from "@/util/cache";
import {
  CanvasKit,
  grayscale,
  loadImage,
  loadImageFromUrl,
} from "@/util/canvas";
import { equippedMark, exotic, legendary } from "@/util/images";
import { EmulatedCanvas2DContext } from "canvaskit-wasm";

interface ItemIcon {
  base: string;
  overlay?: string;
  element?: string;
  equipped?: boolean;
  isExotic?: boolean;
  isSubClass?: boolean;
}

interface ItemIconOptions {
  grayscale?: boolean;
}

export const ItemIcon = async (item: ItemIcon, options: ItemIconOptions) => {
  const source = await Cache.imageFromUrl(item.base, "arraybuffer");
  if (!source) {
    return;
  }
  const Canvas = await CanvasKit;
  const canvas = Canvas.MakeCanvas(144, 144);
  const ctx = canvas.getContext("2d") as EmulatedCanvas2DContext;
  const image = loadImage(Canvas, item.base, source);
  const rarityImage = loadImage(
    Canvas,
    item.isExotic ? "exotic" : "legendary",
    item.isExotic ? exotic : legendary
  );

  ctx.drawImage(image, 0, 0, 144, 144);

  // skip some overlay stuff for subclasses
  if (!item.isSubClass) {
    if (item.overlay) {
      const overlayImage = await loadImageFromUrl(Canvas, item.overlay);
      overlayImage && ctx.drawImage(overlayImage, 0, 0, 144, 144);
    }
    ctx.drawImage(rarityImage, 0, 0, 144, 144);
  }

  if (item.element) {
    const elementImage = await loadImageFromUrl(Canvas, item.element);
    const size = 32;
    const circle = size + 8;
    if (elementImage) {
      ctx.fillStyle = "black";
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(
        144 - circle - 8 + circle / 2,
        144 - circle - 8 + circle / 2,
        circle / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.drawImage(
        elementImage,
        144 - size - 8,
        144 - size - 8,
        size - 8,
        size - 8
      );
    }
  }

  // convert to grayscale
  if (!item.equipped && options.grayscale) {
    grayscale(ctx);
  }

  if (item.equipped && !options.grayscale) {
    const mark = loadImage(Canvas, "equipped-mark", equippedMark);
    const size = 24;
    ctx.drawImage(mark, 12, 144 - 12 - size, size, size);
  }

  const data = canvas.toDataURL();
  return data;
};
