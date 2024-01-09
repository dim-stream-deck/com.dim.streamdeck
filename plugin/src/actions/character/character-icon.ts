import { Character } from "@/state";
import { Cache } from "@/util/cache";
import { CanvasKit } from "@/util/canvas";
import { classes, shadow } from "@/util/images";
import { EmulatedCanvas2DContext } from "canvaskit-wasm";

export const CharacterIcon = async (character: Character) => {
  const iconRes = await Cache.imageFromUrl(character.icon, "arraybuffer");
  const classRes = classes[character.class];

  if (!iconRes) {
    return;
  }

  const Canvas = await CanvasKit;
  const icon = Canvas.MakeImageFromEncoded(iconRes);
  const classIcon = Canvas.MakeImageFromEncoded(classRes);
  const shadowImage = Canvas.MakeImageFromEncoded(shadow);
  const canvas = Canvas.MakeCanvas(144, 144);
  const ctx = canvas.getContext("2d") as EmulatedCanvas2DContext;

  ctx.drawImage(icon, 0, 0, 144, 144);
  ctx.fillStyle = "#000000";
  ctx.globalAlpha = 0.5;
  ctx.fillRect(0, 0, 144, 144);
  ctx.globalAlpha = 1;
  // ctx.drawImage(shadowImage, 0, 0, 144, 144);
  ctx.drawImage(classIcon, 0, 0, 144, 144);

  return canvas.toDataURL();
};
