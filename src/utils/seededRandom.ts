/**
 * Seeded random number generator for deterministic dummy data
 * Uses a Linear Congruential Generator (LCG) for simplicity and predictability
 */

class SeededRandom {
  private seed: number;

  constructor(seed: number | string = 'development') {
    // Convert string seeds to numeric
    if (typeof seed === 'string') {
      this.seed = this.hashString(seed);
    } else {
      this.seed = seed;
    }
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    // LCG parameters (same as Numerical Recipes)
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;

    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate random string
   */
  string(length: number): string {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
    return Array.from({ length }, () => alphabet[Math.floor(this.next() * alphabet.length)]).join(
      ''
    );
  }

  /**
   * Generate random float between min and max
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Pick random element from array
   */
  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  /**
   * Generate deterministic UUID v4-like string
   */
  uuid(): string {
    const hex = (n: number) => {
      const h = Math.floor(this.next() * n).toString(16);
      return h.length === 1 ? '0' + h : h;
    };

    // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // where y is one of 8, 9, a, or b
    return [
      hex(0x100000000).padStart(8, '0'),
      hex(0x10000).padStart(4, '0'),
      '4' + hex(0x1000).padStart(3, '0'), // Version 4
      (this.nextInt(0, 3) + 8).toString(16) + hex(0x1000).padStart(3, '0'), // Variant
      hex(0x1000000000000).padStart(12, '0'),
    ].join('-');
  }

  /**
   * Hash string to number for seed conversion
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Reset seed to original value
   */
  reset(seed?: number | string): void {
    if (seed !== undefined) {
      if (typeof seed === 'string') {
        this.seed = this.hashString(seed);
      } else {
        this.seed = seed;
      }
    }
  }
}

// Create a global instance with a stable seed
// In development, this ensures consistent data across reloads
// In production, you might want to use a different seed or disable dummy data entirely
export const seededRandom = new SeededRandom('econ-trader-dev-2024');

// Export convenience functions that use the global instance
export const random = () => seededRandom.next();
export const randomInt = (min: number, max: number) => seededRandom.nextInt(min, max);
export const randomFloat = (min: number, max: number) => seededRandom.nextFloat(min, max);
export const randomPick = <T>(array: T[]) => seededRandom.pick(array);
export const randomUUID = () => seededRandom.uuid();
export const randomString = (length: number) => seededRandom.string(length);

// Export the class for cases where separate instances are needed
export { SeededRandom };

/**
 * Generate a stable, deterministic ID based on namespace and index
 * This ensures the same ID is always generated for the same input,
 * regardless of when or how many times it's called
 */
export function generateStableId(namespace: string, index: number): string {
  // Create a separate instance with a seed based on namespace and index
  // This ensures the ID is always the same for the same inputs
  const stableSeed = `${namespace}-${index}`;
  const generator = new SeededRandom(stableSeed);
  return generator.uuid();
}
