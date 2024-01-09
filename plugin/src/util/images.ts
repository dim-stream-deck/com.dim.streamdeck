import fs from "fs";

const readAsArrayBuffer = (path: string) => {
  const file = fs.readFileSync(path, null);
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
};

export const shadow = readAsArrayBuffer("./imgs/canvas/shadow.png");

export const exotic = readAsArrayBuffer("./imgs/canvas/item/exotic.png");

export const legendary = readAsArrayBuffer("./imgs/canvas/item/legendary.png");

export const equippedMark = readAsArrayBuffer(
  "./imgs/canvas/item/equipped-mark.png"
);

const warlock = readAsArrayBuffer("./imgs/canvas/character/warlock.png");
const titan = readAsArrayBuffer("./imgs/canvas/character/titan.png");
const hunter = readAsArrayBuffer("./imgs/canvas/character/hunter.png");

export const classes = [titan, hunter, warlock];
