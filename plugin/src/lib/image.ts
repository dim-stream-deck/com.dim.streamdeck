import fs from "fs";

/**
 * Download an image from a URL and return it as ArrayBuffer
 * @param url URL to download
 * @returns ArrayBuffer of the image
 */
export const downloadAsArrayBuffer = async (url: string) => {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  if (res.ok) {
    return buffer;
  }
  return null;
};

/**
 * Download an image from a URL and return it as base64 string
 * @param url URL to download
 * @returns base64 string of the image
 */
export const downloadAsBase64 = async (url: string) => {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  if (res.ok) {
    return toBase64(buffer, res.headers.get("content-type") || "image/png");
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
  return `data:${type};base64,${content}`;
};

/**
 * Read a file from disk and return it as ArrayBuffer
 * @param path The path to the file to read
 * @returns ArrayBuffer of the file
 */
export const readAsArrayBuffer = (path: string) => {
  const file = fs.readFileSync(path, null);
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
};

/**
 * Read a file from disk and return it as base64 string
 * @param path The path to the file to read
 * @returns base64 string of the file
 */
export const readAsBase64 = (path: string) => {
  const file = fs.readFileSync(path, null);
  const parts = path.split(".");
  return toBase64(
    file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength),
    `image/${parts.at(-1)}`
  );
};
