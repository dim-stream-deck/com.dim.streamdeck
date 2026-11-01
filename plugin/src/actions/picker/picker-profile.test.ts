import { expect, it, vi } from "vite-plus/test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { WillAppearEvent } from "@elgato/streamdeck";
import { Profiles } from "./util/options";
import { GridHelper } from "../../lib/grid/helper";

vi.mock("@/dim/api", () => ({
  DIM: { requestPickerItems: vi.fn() },
  buildQuery: () => "is:weapon",
}));
vi.mock("@/state", () => ({ State: { get: () => [] }, Equipment: new Set() }));
vi.mock("@/actions/pull-item/item-icon", () => ({ ItemIcon: vi.fn() }));
vi.mock("@/util/images", () => ({ Loaders: {} }));
vi.mock("./util/ImageIcon", () => ({ ImageIcon: vi.fn() }));

import { DIM } from "@/dim/api";
import { onPickerActivate } from "./util/manager";
import { Schemas } from "@plugin/types";

it("bundles a complete Stream Deck+ picker grid on the selected page", () => {
  const bundle = resolve("plugin/com.dim.streamdeck.sdPlugin");
  const manifest = JSON.parse(readFileSync(`${bundle}/manifest.json`, "utf8"));
  const name = `DIM${Profiles[7]}`;
  expect(manifest.Profiles.find((p: any) => p.DeviceType === 7).Name).toBe(name);
  const archive = `${bundle}/${name}.streamDeckProfile`;
  const entries = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" }).trim().split("\n");
  const root = entries.find((entry) => /^Profiles\/[^/]+\/manifest.json$/.test(entry))!;
  const read = (entry: string) =>
    JSON.parse(execFileSync("unzip", ["-p", archive, entry], { encoding: "utf8" }));
  expect(read("package.json")).toMatchObject({
    FormatVersion: 1,
    DeviceModel: "20GBD9901",
    RequiredPlugins: ["com.dim.streamdeck"],
  });
  const profile = read(root);
  expect(profile.Version).toBe("3.0");
  const pagePath = `${root.slice(0, -"manifest.json".length)}Profiles/${profile.Pages.Current.toUpperCase()}/manifest.json`;
  expect(entries).toContain(pagePath);
  const page = read(pagePath);
  const grid = new GridHelper({ rows: 3, columns: 4 }, { enabled: true }, vi.fn(), vi.fn());
  onPickerActivate(grid, "deck", Schemas.picker({}), { showOk: vi.fn() } as any);
  const ready = vi.fn();
  grid.once("ready", ready);
  for (const [controller, count] of [
    ["Keypad", 8],
    ["Encoder", 4],
  ] as const) {
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
          action: { isNeoInfobar: () => false, setImage: vi.fn(), setTitle: vi.fn() },
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
  grid.destroy();
});
