import { afterEach, expect, it, vi } from "vite-plus/test";
import { Watcher } from "./watcher";
import { ev } from "./ev";

afterEach(() => ev.removeAllListeners());

it("replaces an action listener and removes it on disappearance", () => {
  const watcher = Watcher("state");
  const old = vi.fn();
  const current = vi.fn();
  watcher.start("key", old);
  watcher.start("key", current);
  old.mockClear();
  current.mockClear();
  ev.emit("state");
  expect(old).not.toHaveBeenCalled();
  expect(current).toHaveBeenCalledOnce();
  watcher.stop("key");
  expect(ev.listenerCount("state")).toBe(0);
});
