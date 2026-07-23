/**
 * Mulberry32 PRNG implementation for deterministic random numbers.
 */
export class PRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /**
   * Returns a pseudo-random float between 0 (inclusive) and 1 (exclusive)
   */
  public nextFloat(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const val = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return val;
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   */
  public nextInt(min: number, max: number): number {
    if (min > max) [min, max] = [max, min];
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }

  /**
   * Returns true with given probability float (0.0 to 1.0)
   */
  public rollChance(chance: number): boolean {
    return this.nextFloat() < chance;
  }

  /**
   * Shuffles an array in place deterministically
   */
  public shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.nextFloat() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

export function parseSeedFromUrl(): number | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const seedStr = params.get("seed");
  if (seedStr) {
    const parsed = parseInt(seedStr, 10);
    if (!isNaN(parsed)) return Math.abs(parsed);
  }
  return null;
}

export function generateNewSeed(): number {
  const urlSeed = parseSeedFromUrl();
  if (urlSeed !== null) return urlSeed;
  return Math.floor(Math.random() * 900000) + 100000;
}
