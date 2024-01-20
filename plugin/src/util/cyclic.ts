/**
 * Calculates the modulo of a number
 * @param a number
 * @param b max
 * @returns modulo
 */
export const mod = (a: number, b: number) => ((a % b) + b) % b;

/**
 *
 * @param current current selected element
 * @param available available elements
 * @returns next element in the array (cyclic)
 */
export const next = <const T>(
  current: T,
  available: ReadonlyArray<NonNullable<T>>
) => {
  const idx = Math.max(0, !current ? 0 : available.indexOf(current));
  return available[(idx + 1) % available.length];
};

/**
 *
 * @param current current selected element
 * @param key key to compare
 * @param available available elements
 * @returns next element in the array (cyclic)
 */
export const nextBy = (
  current: string | undefined,
  key: string,
  available: ReadonlyArray<Record<string, string>>,
  dir: "right" | "left" = "right"
) => {
  const keys = available.map((item) => item[key]);
  const idx = Math.max(0, !current ? 0 : keys.indexOf(current));
  return available[mod(idx + (dir === "right" ? 1 : -1), available.length)];
};
