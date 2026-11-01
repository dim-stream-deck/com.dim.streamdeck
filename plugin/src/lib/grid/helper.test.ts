import { expect, it, vi } from "vite-plus/test";
import { GridHelper } from "./helper";

it("notifies grid owners once before clearing close listeners", () => {
  const destroy = vi.fn();
  const close = vi.fn();
  const grid = new GridHelper({ rows: 2, columns: 2 }, { enabled: false }, vi.fn(), destroy);
  grid.init();
  grid.on("close", close);
  grid.destroy();
  grid.destroy();
  expect(close).toHaveBeenCalledOnce();
  expect(destroy).toHaveBeenCalledOnce();
});
