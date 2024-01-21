import EventEmitter from "events";

export const ev = new EventEmitter();
ev.setMaxListeners(0);
