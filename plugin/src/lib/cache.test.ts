import { afterEach, expect, it, vi } from "vite-plus/test";
import { EventEmitter } from "node:events";

vi.mock("@elgato/streamdeck", () => ({ default: { logger: { info: vi.fn(), error: vi.fn() } } }));
vi.mock("node:fs", () => ({ createReadStream: vi.fn(() => new EventEmitter()), createWriteStream: vi.fn() }));

afterEach(() => vi.useRealTimers());

it("starts only one persistence timer when the shared cache is loaded", async () => {
  vi.useFakeTimers();
  const { cache } = await import("../util/cache");
  cache.set("icon", "rendered");
  expect(cache.get("icon")).toBe("rendered");
  expect(vi.getTimerCount()).toBe(1);
});
