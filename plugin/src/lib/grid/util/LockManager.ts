import { GridHelper } from "../helper";
import { range } from "./util";

export type Lock = "first-row" | "last-row" | "first-column" | "last-column";

export const LockManager = (helper: GridHelper) => {
  /**
   * Returns the buttons that are locked by the given lock
   * @param lock the lock to check
   */
  const get = (lock: Lock) => {
    const indexes = lockIndexes(lock);
    return indexes.map((i) => helper.buttons[i]);
  };

  const lockIndexes = (lock: Lock[number]) => {
    const total = helper.size.rows * helper.size.columns;
    switch (lock) {
      case "first-row":
        return range(0, helper.size.columns);
      case "last-row":
        return range(total - helper.size.columns, total);
      case "first-column":
        return range(0, helper.size.rows).map((i) => i * helper.size.columns);
      case "last-column":
        return range(0, helper.size.rows).map(
          (i) => i * helper.size.columns + helper.size.columns - 1
        );
    }
    return [];
  };

  /**
   * Unlock the given buttons
   * @param lock the lock to apply
   */
  const remove = (...locks: Lock[]) => {
    locks.forEach((lock) => get(lock).forEach((btn) => (btn.locked = false)));
  };

  /**
   * Lock the given buttons
   * @param lock the lock to apply
   */
  const add = (
    lock: Lock,
    { start, count }: { start?: number; count?: number }
  ) => {
    const buttons = get(lock).slice(start ?? 0, count ? count + 1 : undefined);
    buttons.forEach((btn) => {
      btn.locked = true;
    });
    return buttons;
  };

  /**
   * Clear all locks
   */
  const clear = () => {
    helper.buttons.forEach((btn) => (btn.locked = false));
  };

  return {
    remove,
    add,
    clear,
    get,
  };
};
