import { afterEach, expect, it, vi } from "vite-plus/test";
import type { WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { Schemas } from "@plugin/types";
import { ev } from "@/util/ev";

vi.mock("canvaskit-wasm/bin/canvaskit.js", async (importOriginal) => {
  const { default: init } = await importOriginal<typeof import("canvaskit-wasm")>();
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  return { default: () => init({ locateFile: () => require.resolve("canvaskit-wasm/bin/canvaskit.wasm") }) };
});
vi.mock("@/util/cache", async () => {
  const { Cache } = await import("@/lib/cache");
  return { cache: Cache<string>({ save: false }) };
});
vi.mock("@/util/images", async () => {
  const { readFileSync } = await import("node:fs");
  const read = (file: string) => {
    const bytes = readFileSync(`plugin/com.dim.streamdeck.sdPlugin/imgs/canvas/${file}.png`);
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  };
  return {
    bungify: (url: string) => url,
    crafted: read("item/crafted"), exotic: read("item/exotic"), legendary: read("item/legendary"),
    equippedMark: read("item/equipped-mark"), shadow: read("shadow"),
    classes: [read("character/titan"), read("character/hunter"), read("character/warlock")],
    Loaders: { exoticGrayscale: "loader", legendaryGrayscale: "loader" },
  };
});
vi.mock("@/lib/image", async () => {
  const { readFileSync } = await import("node:fs");
  const bytes = readFileSync("plugin/com.dim.streamdeck.sdPlugin/imgs/canvas/character/titan.png");
  return { downloadAsArrayBuffer: vi.fn(async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)) };
});
vi.mock("@elgato/streamdeck", () => ({
  SingletonAction: class {}, action: () => (target: unknown) => target,
  default: { settings: { getGlobalSettings: async () => ({ equipmentGrayscale: true }) } },
}));
vi.mock("@/dim/api", () => ({ DIM: {} }));
vi.mock("@/util/logger", () => ({ log: vi.fn() }));
vi.mock("@/state", () => ({ Equipment: new Set(), State: { get: () => ({ class: 0, icon: "character", background: "" }) } }));

import { CanvasKit } from "@/util/canvas";
import { ItemIcon } from "./pull-item/item-icon";
import { CharacterIcon } from "./character/character-icon";
import { LoadoutIcon } from "./loadout/loadout-icon";
import { ArtifactIcon } from "./metrics/artifact-icon";
import { CheckpointIcon } from "./checkpoint/checkpoint-icon";
import { PullItem } from "./pull-item/pull-item";
import { Character } from "./character/character";

const item = Schemas.pullItem({ item: "123", icon: "item", tier: 2, overlay: "overlay", element: "element" });
afterEach(() => ev.removeAllListeners());

it("renders all icon types with real CanvasKit and preserves cached PNGs after disposal", async () => {
  const kit = await CanvasKit;
  const renders = [
    { render: () => ItemIcon(item, { grayscale: true, equipped: false }), size: 144 },
    { render: () => ItemIcon({ ...item, isCrafted: true }, { grayscale: false, equipped: true }), size: 144 },
    { render: () => CharacterIcon({ class: 0, icon: "character", background: "" }), size: 144 },
    { render: () => LoadoutIcon({ icon: "loadout", background: "background" }), size: 96 },
    { render: () => ArtifactIcon("artifact"), size: 72 },
    { render: () => CheckpointIcon("checkpoint", false), size: 144 },
  ];
  for (const { render, size } of renders) {
    const png = await render();
    expect(png).toMatch(/^data:image\/png;base64,/);
    expect(await render()).toBe(png);
    const image = kit.MakeImageFromEncoded(Buffer.from(png!.split(",")[1], "base64"))!;
    try {
      expect([image.width(), image.height()]).toEqual([size, size]);
    } finally {
      image.delete();
    }
  }
});

it("updates pull-item once on appearance and skips the loader for cached images", async () => {
  await ItemIcon(item, { grayscale: true, equipped: false });
  const button = {
    id: "pull", isNeoInfobar: () => false, getSettings: vi.fn(async () => item),
    setImage: vi.fn(), setTitle: vi.fn(),
  };
  const action = new PullItem();
  action.onWillAppear({ action: button } as unknown as WillAppearEvent);
  await vi.waitFor(() => expect(button.setImage).toHaveBeenCalledOnce());
  expect(button.getSettings).toHaveBeenCalledOnce();
  expect(button.setImage.mock.calls[0][0]).toMatch(/^data:image\/png/);
  action.onWillDisappear({ action: button } as unknown as WillDisappearEvent);
});

it("updates character once on appearance", async () => {
  const button = { id: "character", isKey: () => true, setImage: vi.fn() };
  const action = new Character();
  action.onWillAppear({ action: button } as unknown as WillAppearEvent);
  await vi.waitFor(() => expect(button.setImage).toHaveBeenCalledOnce());
  action.onWillDisappear({ action: button } as unknown as WillDisappearEvent);
});
