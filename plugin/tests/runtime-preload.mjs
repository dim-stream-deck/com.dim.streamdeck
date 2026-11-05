// Isolate the packaged plugin from live services during the runtime smoke test.
import http from "node:http";
import https from "node:https";
import { syncBuiltinESMExports } from "node:module";

globalThis.fetch = async (_url, options) => {
  if (process.env.STALL_CHECKPOINTS) {
    return new Promise((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(options.signal.reason), {
        once: true,
      });
    });
  }
  return new Response("[]", { status: 200 });
};
https.request = () => {
  throw new Error("External requests disabled in smoke test");
};
const listen = http.Server.prototype.listen;
http.Server.prototype.listen = function (port, ...args) {
  if (port === 9120) {
    this.once("listening", () => process.stdout.write(`DIM_TEST_PORT:${this.address().port}\n`));
  }
  return listen.call(this, port === 9120 ? 0 : port, ...args);
};
syncBuiltinESMExports();
