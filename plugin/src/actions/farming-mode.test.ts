import { afterEach, expect, it, vi } from "vite-plus/test";
import type { WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { ev } from "@/util/ev";

vi.mock("@elgato/streamdeck", () => ({
  SingletonAction: class {},
  action: () => (target: unknown) => target,
}));
vi.mock("@/dim/api", () => ({ DIM: { toggleFarmingMode: vi.fn() } }));
vi.mock("@/state", () => ({ State: { get: () => true } }));
vi.mock("@/util/logger", () => ({ log: vi.fn() }));

import { FarmingMode } from "./farming-mode";

afterEach(() => ev.removeAllListeners());

it("keeps the remaining farming-mode button subscribed when another disappears", () => {
  const action = new FarmingMode();
  const first = { id: "first", isKey: () => true, setState: vi.fn() };
  const second = { id: "second", isKey: () => true, setState: vi.fn() };
  action.onWillAppear({ action: first } as unknown as WillAppearEvent);
  action.onWillAppear({ action: second } as unknown as WillAppearEvent);
  first.setState.mockClear();
  second.setState.mockClear();
  action.onWillDisappear({ action: first } as unknown as WillDisappearEvent);
  ev.emit("farmingMode");
  expect(first.setState).not.toHaveBeenCalled();
  expect(second.setState).toHaveBeenCalledExactlyOnceWith(1);
});
