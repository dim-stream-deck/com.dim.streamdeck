/**
 * Calculates the modulo of a number
 * @param a number
 * @param b max
 * @returns modulo
 */
export const mod = (a: number, b: number) => ((a % b) + b) % b;

/**
 * Extract the type of the current item
 */
type CurrentType<T> = T extends Record<string, unknown> ? T[keyof T] : T;

/**
 * Cycler class
 * @param items array of items
 * @param extractor function to extract the current id from the item
 */
export class Cycler<const TItem, TCurrent extends CurrentType<TItem>> {
  constructor(
    private readonly items: TItem[],
    private readonly extractor?: (item: TItem) => TCurrent
  ) {}

  private obtain(current: TCurrent | undefined, direction: 1 | -1) {
    const keys = this.items.map((item) => this.extractor?.(item) ?? item);
    const idx = Math.max(0, !current ? 0 : keys.indexOf(current));
    return this.items[mod(idx + direction, this.items.length)] as TItem;
  }

  after(current: TCurrent | undefined) {
    return this.obtain(current, 1);
  }

  before(current: TCurrent | undefined) {
    return this.obtain(current, -1);
  }
}
