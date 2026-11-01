import { afterEach, expect, it, vi } from "vite-plus/test";
import { ev } from "@/util/ev";

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  ev.removeAllListeners();
});

it("waits for definitions and refreshes visible checkpoints when they arrive", async () => {
  vi.useFakeTimers();
  const response = Promise.withResolvers<Response>();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => response.promise),
  );
  const { loadActivities, getActivitiesDefinitions, definitions } = await import("./manager");
  const refresh = vi.fn();
  ev.on("checkpoints", refresh);
  const received = vi.fn();
  const request = getActivitiesDefinitions().then(received);
  const loading = loadActivities();
  await Promise.resolve();
  expect(received).not.toHaveBeenCalled();
  const activity = { ids: { normal: "123" }, encounters: ["Encounter"], images: "/images" };
  const groups = [{ name: "Raid", items: [activity] }];
  response.resolve(new Response(JSON.stringify(groups)));
  await loading;
  await request;
  expect(received).toHaveBeenCalledWith(groups);
  expect(definitions.get("123")).toEqual(activity);
  expect(refresh).toHaveBeenCalledOnce();
});
