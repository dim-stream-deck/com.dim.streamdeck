const cache = new Map<string, string | ArrayBuffer>();

export const bungify = (url: string) => `https://www.bungie.net${url}`;

async function imageFromUrl(
  url: string | undefined,
  format: "arraybuffer"
): Promise<ArrayBuffer | undefined>;

async function imageFromUrl(
  url?: string,
  format?: "base64"
): Promise<string | undefined>;

async function imageFromUrl(
  url?: string,
  format: "base64" | "arraybuffer" = "base64"
) {
  if (!url) {
    return;
  }
  if (cache.has(url)) {
    return cache.get(url);
  }
  const res = await fetch(url.startsWith("/") ? bungify(url) : url);
  const buffer = await res.arrayBuffer();
  if (res.status == 200) {
    if (format === "arraybuffer") {
      cache.set(url, buffer);
      return buffer;
    }

    const type = res.headers.get("content-type");
    const content = Buffer.from(buffer).toString("base64");
    const result = `data:${type}";base64,${content}`;
    cache.set(url, result);
    return result;
  }
}

const canvas = async <T>(
  key: string,
  source: T | undefined,
  fn: () => Promise<string | undefined> | undefined
) => {
  if (!source) {
    return undefined;
  }
  const k = `canvas:${key}`;
  if (cache.has(key)) {
    return cache.get(k) as string;
  }
  const result = await fn();
  result && cache.set(k, result);
  return result;
};

export const Cache = {
  imageFromUrl,
  canvas,
};
