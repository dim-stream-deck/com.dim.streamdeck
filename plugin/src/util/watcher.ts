import { ev } from "@/util/ev";

export const Watcher = (event: string) => {
  const listeners = new Map<string, (data: any) => void>();
  return {
    start: (id: string, cb: (data?: any) => void) => {
      listeners.set(id, cb);
      ev.on(event, cb);
      cb();
    },
    stop: (id: string) => {
      const listener = listeners.get(id);
      listener && ev.off(event, listener);
      listeners.delete(id);
    },
  };
};
