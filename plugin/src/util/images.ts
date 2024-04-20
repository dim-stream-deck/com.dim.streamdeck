import { readAsBase64, readAsArrayBuffer } from "@/lib/image";

export const bungify = (url: string) =>
  url.startsWith("/") ? `https://www.bungie.net${url}` : url;

const base = "./imgs/canvas/";

// static loaded
export const shadow = readAsArrayBuffer(`${base}/shadow.png`);
export const exotic = readAsArrayBuffer(`${base}/item/exotic.png`);
export const legendary = readAsArrayBuffer(`${base}/item/legendary.png`);
export const crafted = readAsArrayBuffer(`${base}/item/crafted.png`);
export const equippedMark = readAsArrayBuffer(`${base}/item/equipped-mark.png`);

// Classes
const warlock = readAsArrayBuffer(`${base}/character/warlock.png`);
const titan = readAsArrayBuffer(`${base}/character/titan.png`);
const hunter = readAsArrayBuffer(`${base}/character/hunter.png`);
export const classes = [titan, hunter, warlock];

// Loaders
export const Loaders = {
  exotic: readAsBase64(`${base}/loader/exotic.png`),
  legendary: readAsBase64(`${base}/loader/legendary.png`),
  exoticGrayscale: readAsBase64(`${base}/loader/exotic-grayscale.png`),
  legendaryGrayscale: readAsBase64(`${base}/loader/legendary-grayscale.png`),
};
