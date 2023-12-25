import { EventEmitter } from "events";

const ev = new EventEmitter();
ev.setMaxListeners(30);

export type GestureType = "single" | "double" | "hold";

export const Gestures = () => {
  const keyDown = new Map<string, number>();
  const keyUp = new Map<string, number>();
  const locks = new Map<string, boolean>();
  const timeouts = new Map<string, NodeJS.Timeout>();

  return {
    start: ev.on.bind(ev),
    stop: ev.removeAllListeners.bind(ev),
    keyDown: (id: string) => {
      const now = Date.now();
      keyDown.set(id, now);
      setTimeout(() => {
        if (keyDown.get(id) === now && keyUp.get(id) === undefined) {
          keyDown.delete(id);
          locks.set(id, true);
          ev.emit(id, "hold");
        }
      }, 500);
    },
    keyUp: (id: string) => {
      const now = Date.now();
      const prevUp = keyUp.get(id);

      if (locks.get(id)) {
        locks.delete(id);
        return;
      }

      keyUp.set(id, now);

      const timeout = timeouts.get(id);

      if (prevUp) {
        if (now - prevUp < 400) {
          timeout && clearTimeout(timeout);
          keyUp.delete(id);
          keyDown.delete(id);
          ev.emit(id, "double");
        }
      } else {
        timeouts.set(
          id,
          setTimeout(() => {
            keyUp.delete(id);
            keyDown.delete(id);
            ev.emit(id, "single");
          }, 400)
        );
      }
    },
  };
};
