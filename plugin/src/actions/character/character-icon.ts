import { Character } from "@/state";
import { cache } from "@/util/cache";
import { CanvasKit } from "@/util/canvas";
import { bungify, classes } from "@/util/images";
import { downloadAsArrayBuffer } from "@fcannizzaro/stream-deck-image";
import { EmulatedCanvas2DContext } from "canvaskit-wasm";

export const CharacterIcon = async (character: Character) => {
  const cacheKey = [character.class, character.icon];

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const iconRes = await downloadAsArrayBuffer(bungify(character.icon));
  const classRes = classes[character.class];

  if (!iconRes) {
    return;
  }

  const Canvas = await CanvasKit;
  const icon = Canvas.MakeImageFromEncoded(iconRes);
  const classIcon = Canvas.MakeImageFromEncoded(classRes);
  const canvas = Canvas.MakeCanvas(144, 144);
  const ctx = canvas.getContext("2d") as EmulatedCanvas2DContext;

  ctx.drawImage(icon, 0, 0, 144, 144);
  ctx.fillStyle = "#000000";
  ctx.globalAlpha = 0.5;
  ctx.fillRect(0, 0, 144, 144);
  ctx.globalAlpha = 1;
  // ctx.drawImage(shadowImage, 0, 0, 144, 144);
  ctx.drawImage(classIcon, 0, 0, 144, 144);

  const image = canvas.toDataURL();
  cache.set(cacheKey, image);
  return image;
};
