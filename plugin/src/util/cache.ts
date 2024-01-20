import { LRUCache } from "lru-cache";
import { createHash } from "node:crypto";
import { createBrotliCompress, createBrotliDecompress } from "node:zlib";
import { createWriteStream, createReadStream } from "node:fs";
import $ from "@elgato/streamdeck";
import { Readable } from "node:stream";
import ms from "ms";
import { stream2buffer } from "./stream";

const md5 = (value: string) => createHash("md5").update(value).digest("hex");

/**
 * Cache for storing the results of expensive operations
 */
const cache = new LRUCache<string, string>({
  max: 1000,
});

type KeyPart = string | number | boolean | undefined | null;

/**
 * Flatten an array of strings into a single string
 * @param values strings to flatten
 * @returns
 */
const flat = (values: KeyPart[]) => md5(values.join(":"));

export const Cache = {
  get: (key: KeyPart[]) => cache.get(flat(key)) ?? "",
  has: (key: KeyPart[]) => cache.has(flat(key)),
  set: (key: KeyPart[], value: string) => cache.set(flat(key), value),
};

/**
 * Update the cache on disk every 10 minutes
 */
setInterval(() => {
  $.logger.info(">> updating cache on disk");
  const readable = new Readable();
  readable.push(JSON.stringify(cache.dump()));
  readable.push(null);
  const cacheFile = createWriteStream("./cache.json.br");
  readable.pipe(createBrotliCompress()).pipe(cacheFile);
}, ms("10m"));

/**
 * Load the cache from disk
 */

const cacheFile = createReadStream("./cache.json.br");

cacheFile.on("error", (error) => {
  $.logger.error(">> failed to load cache from disk", error);
});

cacheFile.on("open", async () => {
  const decompress = cacheFile.pipe(createBrotliDecompress());
  const content = await stream2buffer(decompress);
  cache.load(JSON.parse(content.toString()));
  $.logger.info(">> loaded cache from disk");
});
