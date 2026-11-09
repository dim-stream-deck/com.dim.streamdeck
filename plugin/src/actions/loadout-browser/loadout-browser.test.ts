import { afterEach, expect, it, vi } from "vite-plus/test";
import type { KeyDownEvent, WillAppearEvent } from "@elgato/streamdeck";
import { BrowserLoadouts, Schemas } from "@plugin/types";
import { GridHelper } from "@/lib/grid";
import { ev } from "@/util/ev";

vi.mock("@/dim/api", () => ({ DIM: { requestLoadouts: vi.fn(), equipLoadout: vi.fn() } }));
vi.mock("@/lib/image", () => ({ downloadAsBase64: vi.fn(async () => undefined) }));
vi.mock("@/util/images", () => ({ bungify: (url: string) => url }));
vi.mock("../loadout/loadout-icon", () => ({ LoadoutIcon: vi.fn(async () => "ingame-icon") }));

import { DIM } from "@/dim/api";
import { onLoadoutBrowserActivate } from "./manager";

const grids: GridHelper[] = [];
afterEach(() => {
  grids.forEach((grid) => grid.destroy());
  grids.length = 0;
  vi.clearAllMocks();
  vi.useRealTimers();
});

const open = (columns = 4, rows = 2, encoders = false, settings = {}) => {
  const close = vi.fn();
  const grid = new GridHelper(
    { columns, rows },
    { enabled: encoders, layout: "loadout-browser-layout.json" },
    vi.fn(),
    close,
  );
  grids.push(grid);
  onLoadoutBrowserActivate(grid, "deck", Schemas.loadoutBrowser(settings));
  grid.emit("ready");
  const request = vi.mocked(DIM.requestLoadouts).mock.lastCall![0];
  const respond = (loadouts: BrowserLoadouts["loadouts"], requestId = request.requestId) =>
    ev.emit("loadouts:deck", {
      device: "deck",
      requestId,
      currentCharacter: "hunter",
      loadouts,
    } satisfies BrowserLoadouts);
  const press = (column: number, row = rows - 1) =>
    grid.onPress({ payload: { coordinates: { column, row } } } as KeyDownEvent);
  return { grid, close, respond, press, request };
};
const loadout = (i: number, character = "hunter", classType = 1) => ({
  loadout: `build-${i}`,
  character,
  classType,
  label: `Build ${i}`,
  tags: [i % 2 ? "#PVP" : "#Raid"],
});

it.each([
  [3, 2, false],
  [8, 4, false],
  [4, 3, true],
])("browses and equips on a %sx%s grid with encoders=%s", async (columns, rows, encoders) => {
  const { grid, respond, press, close, request } = open(columns, rows, encoders);
  expect(request).toEqual({ device: "deck", requestId: expect.any(String) });
  const pageSize = columns * (rows - 1);
  respond(Array.from({ length: pageSize + 1 }, (_, i) => loadout(i)));
  await expect.poll(() => grid.buttons[0].id).toBe("build-0:hunter");
  expect(grid.buttons.slice(pageSize).filter((cell) => cell.type === "navigation")).toEqual([
    expect.objectContaining({ title: "", image: "./imgs/canvas/picker/close.png" }),
    expect.objectContaining({ title: "", image: "./imgs/canvas/picker/filters/all.png" }),
    expect.objectContaining({ title: "", image: "./imgs/canvas/picker/next.png" }),
  ]);
  press(columns - 1);
  await expect.poll(() => grid.buttons[0].id).toBe(`build-${pageSize}:hunter`);
  press(0, 0);
  expect(DIM.equipLoadout).toHaveBeenCalledExactlyOnceWith({
    loadout: `build-${pageSize}`,
    character: "hunter",
  });
  // Empty cells on the final page must never equip a previous page's loadout.
  press(1, 0);
  expect(DIM.equipLoadout).toHaveBeenCalledTimes(1);
  press(columns - 1);
  await expect.poll(() => grid.buttons[0].id).toBe("build-0:hunter");
  press(0);
  expect(close).toHaveBeenCalledOnce();
  expect(ev.listenerCount("loadouts:deck")).toBe(0);
});

it("filters by class and hashtag and equips the selected target character", async () => {
  const { grid, respond, press } = open(4, 2, false, { classFilter: "all" });
  respond([loadout(0), loadout(1), loadout(2, "titan", 0)]);
  await expect.poll(() => grid.cells).toHaveLength(3);
  press(1);
  await expect.poll(() => grid.cells.some((cell) => cell.type === "browser:class")).toBe(true);
  expect(grid.buttons[4]).toMatchObject({ title: "", image: "./imgs/canvas/picker/prev.png" });
  expect(grid.buttons[5]).toMatchObject({
    title: "",
    image: "./imgs/canvas/picker/filters/all.png",
  });
  grid.emit(
    "press",
    grid.cells.find((cell) => cell.type === "browser:class" && cell.id === "titan"),
  );
  await expect.poll(() => grid.cells).toHaveLength(1);
  expect(grid.cells[0].id).toBe("build-2:titan");
  press(0, 0);
  expect(DIM.equipLoadout).toHaveBeenLastCalledWith({ loadout: "build-2", character: "titan" });
  press(1);
  await expect.poll(() => grid.cells.some((cell) => cell.type === "browser:tag")).toBe(true);
  grid.emit(
    "press",
    grid.cells.find((cell) => cell.type === "browser:tag" && cell.id === "pvp"),
  );
  await expect.poll(() => grid.cells[0].title).toContain("No matching");
  press(0, 0);
  expect(DIM.equipLoadout).toHaveBeenCalledTimes(1);
});

it("uses starting filters, matches hashtags case-insensitively, and displays in-game icons", async () => {
  const { grid, respond } = open(4, 2, false, { hashtag: " rAiD " });
  const item = { ...loadout(0), inGameIcon: { icon: "/icon", background: "/background" } };
  respond([item, loadout(1), loadout(2, "titan", 0)]);
  await expect.poll(() => grid.cells).toHaveLength(1);
  expect(await (grid.cells[0].image as () => Promise<string>)()).toBe("ingame-icon");
});

it("ignores stale responses and removes session listeners on exit", async () => {
  const first = open();
  first.grid.destroy();
  const second = open();
  second.respond([loadout(0)], first.request.requestId);
  expect(second.grid.cells[0].title).toBe("Loading\nloadouts");
  second.respond([]);
  await expect.poll(() => second.grid.cells[0].title).toContain("No matching");
  second.grid.destroy();
  second.respond([loadout(0)]);
  expect(second.grid.cells).toEqual([]);
  expect(ev.listenerCount("loadouts:deck")).toBe(0);
});

it("shows recovery instructions when DIM does not support the browser", async () => {
  vi.useFakeTimers();
  const { grid } = open();
  await vi.advanceTimersByTimeAsync(8000);
  expect(grid.cells[0].title).toContain("Check DIM");
  grid.destroy();
  expect(vi.getTimerCount()).toBe(0);
});

it("uses the browser touch-strip layout and navigation icons without text", async () => {
  const { grid, respond, press } = open(4, 3, true);
  const action = {
    isNeoInfobar: () => false,
    setImage: vi.fn(),
    setTitle: vi.fn(),
    setFeedbackLayout: vi.fn(),
    setFeedback: vi.fn(),
  };
  grid.link(
    { action, payload: { coordinates: { row: 0, column: 3 } } } as unknown as WillAppearEvent,
    true,
  );
  respond(Array.from({ length: 9 }, (_, i) => loadout(i)));
  await expect.poll(() => action.setFeedback.mock.lastCall?.[0]?.title).toBe("");
  expect(grid.buttons[8].title).toBe("");
  expect(grid.buttons[9]).toMatchObject({
    title: "",
    image: "./imgs/canvas/picker/filters/all.png",
  });
  expect(action.setFeedbackLayout).toHaveBeenCalledWith("loadout-browser-layout.json");
  press(1);
  await expect.poll(() => grid.buttons[8].image).toBe("./imgs/canvas/picker/prev.png");
  expect(grid.buttons[8].title).toBe("");
  expect(grid.buttons[9].title).toBe("");
});
