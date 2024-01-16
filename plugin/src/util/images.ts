import fs from "fs";

const bungify = (url: string) => `https://www.bungie.net${url}`;

/**
 * Download an image from a URL and return it as ArrayBuffer
 * @param url URL to download
 * @returns ArrayBuffer of the image
 */
export const downloadAsArrayBuffer = async (url: string) => {
  const res = await fetch(url.startsWith("/") ? bungify(url) : url);
  const buffer = await res.arrayBuffer();
  if (res.status == 200) {
    return buffer;
  }
  return null;
};

/**
 * Convert an ArrayBuffer to a base64 string
 * @param buffer The ArrayBuffer to convert
 * @param type The mime type of the image
 * @returns The base64 string
 */
export const toBase64 = (buffer: ArrayBuffer | null, type: string) => {
  if (!buffer) return "";
  const content = Buffer.from(buffer).toString("base64");
  return `data:${type}";base64,${content}`;
};

const readAsArrayBuffer = (path: string) => {
  const file = fs.readFileSync(path, null);
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
};

const readAsBase64 = (path: string) => {
  const file = fs.readFileSync(path, null);
  return toBase64(
    file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength),
    "image/png"
  );
};

// static loaded

export const shadow = readAsArrayBuffer("./imgs/canvas/shadow.png");

export const exotic = readAsArrayBuffer("./imgs/canvas/item/exotic.png");

export const legendary = readAsArrayBuffer("./imgs/canvas/item/legendary.png");

export const crafted = readAsArrayBuffer("./imgs/canvas/item/crafted.png");

export const equippedMark = readAsArrayBuffer(
  "./imgs/canvas/item/equipped-mark.png"
);

// Classes

const warlock = readAsArrayBuffer("./imgs/canvas/character/warlock.png");
const titan = readAsArrayBuffer("./imgs/canvas/character/titan.png");
const hunter = readAsArrayBuffer("./imgs/canvas/character/hunter.png");
export const classes = [titan, hunter, warlock];

// Base64

const exoticLoader = readAsBase64("./imgs/canvas/loader/exotic.png");

const legendaryLoader = readAsBase64("./imgs/canvas/loader/legendary.png");

const exoticGrayscaleLoader = readAsBase64(
  "./imgs/canvas/loader/exotic-grayscale.png"
);

const legendaryGrayscaleLoader = readAsBase64(
  "./imgs/canvas/loader/legendary-grayscale.png"
);

export const Loaders = {
  exotic: exoticLoader,
  legendary: legendaryLoader,
  exoticGrayscale: exoticGrayscaleLoader,
  legendaryGrayscale: legendaryGrayscaleLoader,
};
