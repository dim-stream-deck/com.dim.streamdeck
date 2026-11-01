import CanvasKitInit, {
  EmulatedCanvas2DContext,
  Image,
  EmulatedCanvas2D,
} from "canvaskit-wasm/bin/canvaskit.js";
import { splitAt } from "remeda";

export const CanvasKit = CanvasKitInit({
  locateFile: (file) => process.cwd() + "/" + file,
});

// Native images belong to one render. Only encoded bytes are shared between renders.
export const withCanvas = async (
  kit: Awaited<typeof CanvasKit>,
  width: number,
  height: number,
  render: (
    canvas: EmulatedCanvas2D,
    decode: (bytes: ArrayBuffer | null) => Image | null
  ) => Promise<string>
) => {
  const canvas = kit.MakeCanvas(width, height);
  const images: Image[] = [];
  const decode = (bytes: ArrayBuffer | null) => {
    const image = bytes ? kit.MakeImageFromEncoded(bytes) : null;
    if (image) images.push(image);
    return image;
  };
  try {
    return await render(canvas, decode);
  } finally {
    canvas.dispose();
    images.forEach((image) => image.delete());
  }
};

export const grayscale = (ctx: EmulatedCanvas2DContext) => {
  const imageData = ctx.getImageData(0, 0, 144, 144);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg; // red
    data[i + 1] = avg; // green
    data[i + 2] = avg; // blue
  }
  ctx.putImageData(imageData, 0, 0);
};

export const splitTitle = (text?: string | null) =>
  text
    ? splitAt(Array.from(text), 6)
        .map((it) => it.join(""))
        .join("\n")
        .trim()
    : "";
