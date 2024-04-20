import { GridHelper } from "../helper";

/**
 * Calculates the modulo of a number
 * @param a number
 * @param b max
 * @returns modulo
 */
export const mod = (a: number, b: number) => ((a % b) + b) % b;

/**
 * Returns an array of numbers from start to end
 * @param start
 * @param end
 * @returns array of numbers
 */
export const range = (start: number, end: number) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};

export type ButtonPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-center"
  | "bottom-left"
  | "bottom-right";

/**
 * Calculates the index of a button based on its position
 * @param position the position of the button
 * @param size the size of the grid
 * @returns the index of the button
 */
export const idxByPosition = (
  position: ButtonPosition,
  size: GridHelper["size"]
) => {
  switch (position) {
    case "top-left":
      return 0;
    case "top-center":
      return Math.floor(size.columns / 2);
    case "top-right":
      return size.columns - 1;
    case "bottom-left":
      return size.columns * (size.rows - 1);
    case "bottom-center":
      return size.columns * (size.rows - 1) + Math.floor(size.columns / 2);
    case "bottom-right":
      return size.columns * size.rows - 1;
  }
};

export const ResetAction = {
  image: "",
  title: "",
  type: undefined,
  onTrigger: null,
  onDialRight: null,
  onDialLeft: null,
  loader: undefined,
};
