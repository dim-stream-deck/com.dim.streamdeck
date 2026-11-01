// Isolate the packaged plugin from live services during the runtime smoke test.
import http from "node:http";
import https from "node:https";
import { syncBuiltinESMExports } from "node:module";

globalThis.fetch = async () => new Response("[]", { status: 404 });
https.request = () => {
  throw new Error("External requests disabled in smoke test");
};
const listen = http.Server.prototype.listen;
http.Server.prototype.listen = function (port, ...args) {
  return listen.call(this, port === 9120 ? 0 : port, ...args);
};
syncBuiltinESMExports();
