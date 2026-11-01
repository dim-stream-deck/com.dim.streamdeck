import { expect, it, vi } from "vite-plus/test";
import type { CanvasKit as Kit } from "canvaskit-wasm";

vi.mock("canvaskit-wasm/bin/canvaskit.js", () => ({ default: () => Promise.resolve({}) }));
import { withCanvas } from "./canvas";

it.each([false, true])("releases canvases and decoded images after render failure=%s", async (fails) => {
  const canvas = { dispose: vi.fn() };
  const images = [{ delete: vi.fn() }, { delete: vi.fn() }];
  const kit = {
    MakeCanvas: () => canvas,
    MakeImageFromEncoded: vi.fn().mockReturnValueOnce(images[0]).mockReturnValueOnce(images[1]),
  } as unknown as Kit;
  const result = withCanvas(kit, 144, 144, async (_, decode) => {
    decode(new ArrayBuffer(1));
    await Promise.resolve();
    decode(new ArrayBuffer(1));
    expect(canvas.dispose).not.toHaveBeenCalled();
    if (fails) throw new Error("render failed");
    return "data:image/png;base64,rendered";
  });
  if (fails) await expect(result).rejects.toThrow("render failed");
  else expect(await result).toBe("data:image/png;base64,rendered");
  expect(canvas.dispose).toHaveBeenCalledOnce();
  images.forEach((image) => expect(image.delete).toHaveBeenCalledOnce());
});
