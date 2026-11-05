import { afterEach, expect, it, vi } from "vite-plus/test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import streamDeck, { type KeyDownEvent, type WillAppearEvent } from "@elgato/streamdeck";
import { Profiles } from "./util/options";
import { getGrid } from "../../lib/grid/manager";
import { ev } from "@/util/ev";

vi.mock("@elgato/streamdeck", () => ({
  default: {
    profiles: { switchToProfile: vi.fn() },
    settings: { getGlobalSettings: vi.fn(async () => ({ pullItemTileLayout: "fill" })) },
  },
  SingletonAction: class {},
  action: () => (target: unknown) => target,
}));
vi.mock("@/dim/api", () => ({
  DIM: {
    requestPickerItems: vi.fn(),
    requestPerks: vi.fn(() => ev.emit("perks", [])),
    pullItem: vi.fn(),
  },
  buildQuery: vi.fn(() => "is:weapon"),
}));
vi.mock("@/util/logger", () => ({ log: vi.fn() }));
vi.mock("@/state", () => ({ State: { get: () => [] }, Equipment: new Set() }));
vi.mock("@/actions/pull-item/item-icon", () => ({ ItemIcon: vi.fn() }));
vi.mock("@/util/images", () => ({ Loaders: {} }));
vi.mock("./util/ImageIcon", () => ({ ImageIcon: vi.fn() }));

import { DIM, buildQuery } from "@/dim/api";
import { Picker } from "./picker";
import { ItemIcon } from "@/actions/pull-item/item-icon";

afterEach(() => vi.clearAllMocks());

it.each([
  { device: "Stream Deck+", type: 7, model: "20GBD9901", encoders: true },
  { device: "Stream Deck Neo", type: 9, model: "20GBJ9901", encoders: false },
])(
  "bundles a complete $device picker grid on the selected page",
  async ({ type, model, encoders }) => {
    const bundle = resolve("plugin/com.dim.streamdeck.sdPlugin");
    const manifest = JSON.parse(readFileSync(`${bundle}/manifest.json`, "utf8"));
    const name = `DIM${Profiles[type]}`;
    expect(manifest.Profiles.find((p: any) => p.DeviceType === type)).toMatchObject({
      Name: name,
      Readonly: true,
      DontAutoSwitchWhenInstalled: true,
    });
    const archive = `${bundle}/${name}.streamDeckProfile`;
    const entries = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" })
      .trim()
      .split("\n");
    const root = entries.find((entry) => /^Profiles\/[^/]+\/manifest.json$/.test(entry))!;
    const read = (entry: string) =>
      JSON.parse(execFileSync("unzip", ["-p", archive, entry], { encoding: "utf8" }));
    expect(read("package.json")).toMatchObject({
      FormatVersion: 1,
      DeviceModel: model,
      RequiredPlugins: ["com.dim.streamdeck"],
    });
    const profile = read(root);
    expect(profile.Version).toBe("3.0");
    expect(profile.Device.Model).toBe(model);
    const pagePath = `${root.slice(0, -"manifest.json".length)}Profiles/${profile.Pages.Current.toUpperCase()}/manifest.json`;
    expect(entries).toContain(pagePath);
    const page = read(pagePath);
    const event = {
      action: {
        device: { id: "deck", type, size: { rows: 2, columns: 4 } },
        showOk: vi.fn(),
      },
      payload: { settings: { category: "weapon", filters: ["element", "rarity"] } },
    } as unknown as KeyDownEvent;
    await new Picker().onKeyDown(event);
    expect(streamDeck.profiles.switchToProfile).toHaveBeenCalledExactlyOnceWith("deck", name);
    const grid = getGrid(event)!;
    expect(grid.hasTouchBar).toBe(encoders);
    const ready = vi.fn();
    grid.once("ready", ready);
    expect(page.Controllers.map((c: any) => c.Type)).toEqual(
      encoders ? ["Keypad", "Encoder"] : ["Keypad"],
    );
    for (const [controller, count] of encoders
      ? ([
          ["Keypad", 8],
          ["Encoder", 4],
        ] as const)
      : ([["Keypad", 8]] as const)) {
      const actions = page.Controllers.find((c: any) => c.Type === controller).Actions;
      expect(Object.keys(actions)).toHaveLength(count);
      for (const [position, action] of Object.entries(actions)) {
        expect((action as any).UUID).toBe("com.dim.streamdeck.tile");
        const [column, row] = position.split(",").map(Number);
        expect(column).toBeLessThan(4);
        expect(row).toBeLessThan(controller === "Keypad" ? 2 : 1);
        grid.link(
          {
            payload: { controller, coordinates: { column, row } },
            action: {
              isNeoInfobar: () => false,
              setImage: vi.fn(),
              setTitle: vi.fn(),
              setFeedbackLayout: vi.fn(),
              setFeedback: vi.fn(),
            },
          } as unknown as WillAppearEvent,
          controller === "Encoder",
        );
      }
    }
    expect(ready).toHaveBeenCalledOnce();
    expect(DIM.requestPickerItems).toHaveBeenCalledExactlyOnceWith({
      device: "deck",
      query: "is:weapon",
    });
    try {
      if (!encoders) {
        ev.emit(
          "pickerItems:deck",
          Array.from({ length: 9 }, (_, i) => ({ item: `item-${i}` })),
        );
        await expect.poll(() => grid.buttons[0].id).toBe("item-0");
        expect(ItemIcon).toHaveBeenCalledWith({ item: "item-0" }, { layout: "fill" });
        expect(grid.buttons.slice(0, 4).map((button) => button.id)).toEqual([
          "item-0",
          "item-1",
          "item-2",
          "item-3",
        ]);
        expect(grid.buttons.slice(4).map((button) => button.type)).toEqual([
          "navigation",
          "element",
          "rarity",
          "navigation",
        ]);
        const press = (column: number, row: number) =>
          grid.onPress({
            payload: { coordinates: { column, row } },
          } as KeyDownEvent);
        press(0, 0);
        expect(DIM.pullItem).toHaveBeenCalledExactlyOnceWith({ itemId: "item-0", type: "pull" });
        expect(event.action.showOk).toHaveBeenCalledOnce();
        press(3, 1);
        await expect.poll(() => grid.buttons[0].id).toBe("item-4");
        press(3, 1);
        await expect.poll(() => grid.buttons[0].id).toBe("item-8");
        press(3, 1);
        await expect.poll(() => grid.buttons[0].id).toBe("item-0");
        press(1, 1);
        expect(buildQuery).toHaveBeenLastCalledWith({ element: "solar", rarity: "all" }, "weapon");
        ev.emit("pickerItems:deck", []);
        await expect.poll(() => grid.buttons[0].type).toBeUndefined();
        expect(grid.buttons[0].image).toBe("");
        expect(grid.buttons[7].type).toBeUndefined();
        press(0, 1);
        expect(streamDeck.profiles.switchToProfile).toHaveBeenLastCalledWith("deck");
        expect(ev.listenerCount("pickerItems:deck")).toBe(0);
      }
    } finally {
      grid.destroy();
    }
  },
);
