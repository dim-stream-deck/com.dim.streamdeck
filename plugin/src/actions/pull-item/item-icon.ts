import { Cache } from "@/util/cache";
import {
  CanvasKit,
  grayscale,
  loadImage,
  loadImageFromUrl,
} from "@/util/canvas";
import { equippedMark, exotic, legendary } from "@/util/images";
import { PullItemSettings } from "@plugin/types";
import { EmulatedCanvas2DContext } from "canvaskit-wasm";

interface ItemIconOptions {
  grayscale?: boolean;
  equipped?: boolean;
}

export const ItemIcon = async (
  item: PullItemSettings,
  options?: ItemIconOptions
) => {
  if (!item.icon) {
    return;
  }
  const source = await Cache.imageFromUrl(item.icon, "arraybuffer");
  if (!source) {
    return;
  }
  const Canvas = await CanvasKit;
  const canvas = Canvas.MakeCanvas(144, 144);
  const ctx = canvas.getContext("2d") as EmulatedCanvas2DContext;
  const image = loadImage(Canvas, item.icon, source);
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

  if (options) {
    // convert to grayscale
    if (!options.equipped && options.grayscale) {
      grayscale(ctx);
    }

    if (options.equipped && !options.grayscale) {
      const mark = loadImage(Canvas, "equipped-mark", equippedMark);
      const size = 24;
      ctx.drawImage(mark, 12, 144 - 12 - size, size, size);
    }
  }

  return canvas.toDataURL();
};
