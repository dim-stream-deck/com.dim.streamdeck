import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

it("shares concurrent downloads and reuses completed bytes", async () => {
  const response = Promise.withResolvers<Response>();
  const fetch = vi.fn(() => response.promise);
  vi.stubGlobal("fetch", fetch);
  const { downloadAsArrayBuffer } = await import("./image");
  const first = downloadAsArrayBuffer("https://example.test/icon.png");
  const second = downloadAsArrayBuffer("https://example.test/icon.png");
  response.resolve(new Response(new Uint8Array([1, 2, 3])));
  const bytes = await first;
  expect(await second).toBe(bytes);
  expect(await downloadAsArrayBuffer("https://example.test/icon.png")).toBe(bytes);
  expect(fetch).toHaveBeenCalledOnce();
});

it("retries HTTP failures and rejected downloads", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(new Response(new Uint8Array([1])));
  vi.stubGlobal("fetch", fetch);
  const { downloadAsArrayBuffer } = await import("./image");
  expect(await downloadAsArrayBuffer("icon")).toBeNull();
  await expect(downloadAsArrayBuffer("icon")).rejects.toThrow("offline");
  expect((await downloadAsArrayBuffer("icon"))?.byteLength).toBe(1);
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("evicts old bytes when the cache exceeds its size budget", async () => {
  const fetch = vi.fn(async () => new Response(new Uint8Array(17 * 1024 * 1024)));
  vi.stubGlobal("fetch", fetch);
  const { downloadAsArrayBuffer } = await import("./image");
  await downloadAsArrayBuffer("first");
  await downloadAsArrayBuffer("second");
  await downloadAsArrayBuffer("first");
  expect(fetch).toHaveBeenCalledTimes(3);
});
