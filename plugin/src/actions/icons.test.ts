import { afterEach, expect, it, vi } from "vite-plus/test";
import type { WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { Schemas } from "@plugin/types";
import { ev } from "@/util/ev";

vi.mock("canvaskit-wasm/bin/canvaskit.js", async (importOriginal) => {
  const { default: init } = await importOriginal<typeof import("canvaskit-wasm")>();
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  return {
    default: () => init({ locateFile: () => require.resolve("canvaskit-wasm/bin/canvaskit.wasm") }),
  };
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
    itemFont: (() => {
      const bytes = readFileSync(
        "plugin/com.dim.streamdeck.sdPlugin/imgs/canvas/item/NotoSans-Regular.ttf",
      );
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    })(),
    exotic: read("item/exotic"),
    legendary: read("item/legendary"),
    equippedMark: read("item/equipped-mark"),
    shadow: read("shadow"),
    classes: [read("character/titan"), read("character/hunter"), read("character/warlock")],
    Loaders: { exoticGrayscale: "loader", legendaryGrayscale: "loader" },
  };
});
vi.mock("@/lib/image", async () => {
  const { readFileSync } = await import("node:fs");
  const bytes = readFileSync("plugin/com.dim.streamdeck.sdPlugin/imgs/canvas/character/titan.png");
  return {
    downloadAsArrayBuffer: vi.fn(async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    ),
  };
});
vi.mock("@elgato/streamdeck", () => ({
  SingletonAction: class {},
  action: () => (target: unknown) => target,
  default: {
    settings: {
      getGlobalSettings: vi.fn(async () => ({ equipmentGrayscale: true })),
      onDidReceiveGlobalSettings: vi.fn(),
    },
  },
}));
vi.mock("@/dim/api", () => ({ DIM: {} }));
vi.mock("@/util/logger", () => ({ log: vi.fn() }));
vi.mock("@/state", () => ({
  Equipment: new Set(),
  State: { get: () => ({ class: 0, icon: "character", background: "" }) },
}));

import $ from "@elgato/streamdeck";
import { downloadAsArrayBuffer } from "@/lib/image";
import { CanvasKit } from "@/util/canvas";
import { ItemIcon } from "./pull-item/item-icon";
import { CharacterIcon } from "./character/character-icon";
import { LoadoutIcon } from "./loadout/loadout-icon";
import { ArtifactIcon } from "./metrics/artifact-icon";
import { CheckpointIcon } from "./checkpoint/checkpoint-icon";
import { PullItem } from "./pull-item/pull-item";
import { Character } from "./character/character";

const item = Schemas.pullItem({
  item: "123",
  icon: "item",
  tier: 2,
  overlay: "overlay",
  element: "element",
});
afterEach(() => ev.removeAllListeners());

it("renders all icon types with real CanvasKit and preserves cached PNGs after disposal", async () => {
  const kit = await CanvasKit;
  const renders = [
    { render: () => ItemIcon(item, { grayscale: true, equipped: false }), size: 144 },
    {
      render: () => ItemIcon({ ...item, isCrafted: true }, { grayscale: false, equipped: true }),
      size: 144,
    },
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
    id: "pull",
    isNeoInfobar: () => false,
    getSettings: vi.fn(async () => item),
    setImage: vi.fn(),
    setTitle: vi.fn(),
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

it("renders DIM's power strip and tier pips without changing subclass icons", async () => {
  const kit = await CanvasKit;
  const settings = Schemas.pullItem({ ...item, power: "510", tier: 5, masterwork: true });
  const png = await ItemIcon(settings);
  const image = kit.MakeImageFromEncoded(Buffer.from(png!.split(",")[1], "base64"))!;
  const canvas = kit.MakeCanvas(144, 144);
  try {
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0);
    expect(Array.from(ctx.getImageData(28, 31, 1, 1).data)).toEqual([252, 255, 153, 255]);
    expect(Array.from(ctx.getImageData(16, 130, 1, 1).data)).toEqual([116, 87, 0, 255]);
    const text = ctx.getImageData(80, 123, 50, 20).data;
    expect(Array.from(text).filter((_, i) => i % 4 === 0 && text[i] > 220).length).toBeGreaterThan(
      20,
    );
  } finally {
    image.delete();
    canvas.dispose();
  }
  const subclass = { ...item, isSubClass: true };
  expect(await ItemIcon({ ...settings, isSubClass: true })).toBe(await ItemIcon(subclass));
});

it("invalidates cached item art when DIM's appearance details change", async () => {
  const original = await ItemIcon(item);
  for (const change of [
    { power: 514 },
    { breaker: "breaker" },
    { badge: "badge" },
    { seasonIcon: "season" },
    { masterwork: true },
    { locked: true },
    { tier: 5 },
    { craftedOverlay: "crafted-overlay" },
    { craftedBackground: "crafted-background" },
  ]) {
    expect(await ItemIcon({ ...item, ...change })).not.toBe(original);
  }
});

it("keeps crafted symbols above the strip and avoids duplicate season watermarks", async () => {
  const kit = await CanvasKit;
  const fixture = kit.MakeCanvas(144, 144);
  let bytes: ArrayBuffer;
  try {
    const ctx = fixture.getContext("2d")!;
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(4, 125, 20, 15);
    const png = Buffer.from(fixture.toDataURL().split(",")[1], "base64");
    bytes = png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength);
  } finally {
    fixture.dispose();
  }
  await vi.mocked(downloadAsArrayBuffer).withImplementation(
    async () => bytes,
    async () => {
      const requestStart = vi.mocked(downloadAsArrayBuffer).mock.calls.length;
      const png = await ItemIcon({
        ...item,
        power: 510,
        isCrafted: true,
        craftedOverlay: "crafted-symbol",
        seasonIcon: "season-icon",
      });
      const requests = vi.mocked(downloadAsArrayBuffer).mock.calls.map(([url]) => url);
      expect(requests.slice(requestStart)).not.toContain("overlay");
      const image = kit.MakeImageFromEncoded(Buffer.from(png!.split(",")[1], "base64"))!;
      const canvas = kit.MakeCanvas(144, 144);
      try {
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(image, 0, 0);
        expect(Array.from(ctx.getImageData(28, 110, 1, 1).data)).toEqual([255, 0, 0, 255]);
        expect(Array.from(ctx.getImageData(16, 130, 1, 1).data)).toEqual([0, 0, 0, 255]);
      } finally {
        image.delete();
        canvas.dispose();
      }
    },
  );
});

it("uses the standard crafted symbol for saved actions without new DIM layers", async () => {
  const saved = { ...item, isCrafted: true };
  expect(await ItemIcon(saved)).toBe(
    await ItemIcon({
      ...saved,
      craftedOverlay: "/img/destiny_content/items/crafted-icon-overlay.png",
      craftedBackground: "/img/destiny_content/items/crafted-icon-background.png",
    }),
  );
});

it("centers season markers over the same tier column for crafted and ordinary items", async () => {
  const kit = await CanvasKit;
  const fixture = kit.MakeCanvas(96, 96);
  let bytes: ArrayBuffer;
  let blank: ArrayBuffer;
  try {
    const ctx = fixture.getContext("2d")!;
    const empty = Buffer.from(fixture.toDataURL().split(",")[1], "base64");
    blank = empty.buffer.slice(empty.byteOffset, empty.byteOffset + empty.byteLength);
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, 0, 96, 96);
    const png = Buffer.from(fixture.toDataURL().split(",")[1], "base64");
    bytes = png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength);
  } finally {
    fixture.dispose();
  }
  await vi.mocked(downloadAsArrayBuffer).withImplementation(
    async (url) => (url === "aligned-season" ? bytes : blank),
    async () => {
      const centers: number[] = [];
      for (const isCrafted of [false, true]) {
        const png = await ItemIcon({
          ...item,
          icon: "aligned-item",
          seasonIcon: "aligned-season",
          tier: 5,
          isCrafted,
        });
        const image = kit.MakeImageFromEncoded(Buffer.from(png!.split(",")[1], "base64"))!;
        const canvas = kit.MakeCanvas(144, 144);
        try {
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(image, 0, 0);
          const pixels = ctx.getImageData(0, 0, 144, 121).data;
          const pips: number[] = [];
          const rows: number[] = [];
          const markerRows: number[] = [];
          for (let y = 0; y < 121; y++) {
            for (let x = 0; x < 144; x++) {
              const i = (y * 144 + x) * 4;
              if (pixels[i] === 255 && pixels[i + 1] === 0) markerRows.push(y);
              if (pixels[i] === 252 && pixels[i + 1] === 255 && pixels[i + 2] === 153) {
                pips.push(x);
                rows.push(y);
              }
            }
          }
          const marker = ctx.getImageData(0, 10, 144, 1).data;
          const markerXs = Array.from({ length: 144 }, (_, x) => x).filter(
            (x) => marker[x * 4] === 255 && marker[x * 4 + 1] === 0,
          );
          expect(pips.length).toBeGreaterThan(0);
          const center = (xs: number[]) => (Math.min(...xs) + Math.max(...xs)) / 2;
          expect(Math.abs(center(markerXs) - center(pips))).toBeLessThanOrEqual(1);
          expect(Math.max(...pips) - Math.min(...pips) + 1).toBeGreaterThanOrEqual(10);
          expect(Math.max(...pips) - Math.min(...pips) + 1).toBeLessThanOrEqual(17);
          expect(Math.min(...rows) - Math.max(...markerRows)).toBeGreaterThanOrEqual(3);
          if (isCrafted) expect(Math.max(...rows)).toBeLessThan(92);
          centers.push(center(pips));
        } finally {
          image.delete();
          canvas.dispose();
        }
      }
      // Different diamond sizes can round their rasterized edges by half a pixel.
      expect(Math.abs(centers[0] - centers[1])).toBeLessThanOrEqual(0.5);
    },
  );
});

it("fits the full square artwork above the footer without cropping its corners", async () => {
  const kit = await CanvasKit;
  const fixture = kit.MakeCanvas(144, 144);
  let bytes: ArrayBuffer;
  try {
    const ctx = fixture.getContext("2d")!;
    for (const [color, x, y] of [
      ["#ff0000", 8, 8],
      ["#00ff00", 112, 8],
      ["#0000ff", 8, 112],
      ["#00ffff", 112, 112],
    ] as const) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 24, 24);
    }
    const png = Buffer.from(fixture.toDataURL().split(",")[1], "base64");
    bytes = png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength);
  } finally {
    fixture.dispose();
  }
  await vi.mocked(downloadAsArrayBuffer).withImplementation(
    async () => bytes,
    async () => {
      const png = await ItemIcon(Schemas.pullItem({ icon: "four-corners", power: 508 }));
      const image = kit.MakeImageFromEncoded(Buffer.from(png!.split(",")[1], "base64"))!;
      const canvas = kit.MakeCanvas(144, 144);
      try {
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(image, 0, 0);
        const pixel = (x: number, y: number) => Array.from(ctx.getImageData(x, y, 1, 1).data);
        // The existing rarity overlay tints the image; each corner must keep its source color.
        for (const [x, y, channels] of [
          [34, 22, [true, false, false]],
          [110, 22, [false, true, false]],
          [34, 98, [false, false, true]],
          [110, 98, [false, true, true]],
        ] as const) {
          const color = pixel(x, y);
          channels.forEach((bright, i) => {
            if (bright) expect(color[i]).toBeGreaterThan(192);
            else expect(color[i]).toBeLessThan(64);
          });
          expect(color[3]).toBe(255);
        }
        expect(pixel(0, 70)[3]).toBe(0);
        expect(pixel(143, 70)[3]).toBe(0);
        expect(pixel(16, 130)).toEqual([0, 0, 0, 255]);
      } finally {
        image.delete();
        canvas.dispose();
      }
    },
  );
});

it("switches between full-key and DIM layouts without reusing the other layout's cache", async () => {
  const kit = await CanvasKit;
  const settings = { ...item, icon: "layout-switch", power: 510 };
  const dim = await ItemIcon(settings);
  const fill = await ItemIcon(settings, { layout: "fill" });
  expect(fill).not.toBe(dim);
  expect(await ItemIcon(settings, { layout: "dim" })).toBe(dim);
  expect(await ItemIcon(settings, { layout: "fill" })).toBe(fill);
  for (const [png, alpha] of [
    [dim, 0],
    [fill, 255],
  ] as const) {
    const image = kit.MakeImageFromEncoded(Buffer.from(png!.split(",")[1], "base64"))!;
    const canvas = kit.MakeCanvas(144, 144);
    try {
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      expect(ctx.getImageData(0, 130, 1, 1).data[3]).toBe(alpha);
      expect(ctx.getImageData(143, 130, 1, 1).data[3]).toBe(alpha);
    } finally {
      image.delete();
      canvas.dispose();
    }
  }
  const subclass = { ...settings, isSubClass: true };
  expect(await ItemIcon(subclass, { layout: "fill" })).toBe(
    await ItemIcon(subclass, { layout: "dim" }),
  );
});

it("refreshes every visible Pull Item key after the global layout changes", async () => {
  const buttons = ["global-layout-1", "global-layout-2"].map((id) => ({
    id,
    isNeoInfobar: () => false,
    getSettings: vi.fn(async () => item),
    setImage: vi.fn(),
    setTitle: vi.fn(),
  }));
  await ItemIcon(item, { layout: "dim", grayscale: true, equipped: false });
  const action = new PullItem();
  Object.defineProperty(action, "actions", { value: buttons });
  try {
    for (const button of buttons)
      action.onWillAppear({ action: button } as unknown as WillAppearEvent);
    await vi.waitFor(() =>
      buttons.forEach((button) => expect(button.setImage).toHaveBeenCalledOnce()),
    );
    const before = buttons.map((button) => button.setImage.mock.calls[0][0]);
    vi.mocked($.settings.getGlobalSettings)
      .mockResolvedValueOnce({ equipmentGrayscale: true, pullItemTileLayout: "fill" })
      .mockResolvedValueOnce({ equipmentGrayscale: true, pullItemTileLayout: "fill" });
    const callback = vi.mocked($.settings.onDidReceiveGlobalSettings).mock.calls.at(-1)![0];
    await callback({} as Parameters<typeof callback>[0]);
    const expected = await ItemIcon(item, { layout: "fill", grayscale: true, equipped: false });
    buttons.forEach((button, i) => {
      expect(button.setImage).toHaveBeenLastCalledWith(expected);
      expect(expected).not.toBe(before[i]);
    });
  } finally {
    for (const button of buttons)
      action.onWillDisappear({ action: button } as unknown as WillDisappearEvent);
  }
});
