/**
 * Simple seeded random number generator using LCG.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    // Ensure seed is a positive integer
    this.state = Math.abs(Math.floor(seed)) % 2147483647;
    if (this.state === 0) this.state = 123456789;
  }

  /**
   * Returns a random float between 0 and 1.
   */
  next(): number {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }

  /**
   * Returns a random integer between min (inclusive) and max (exclusive).
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
}
