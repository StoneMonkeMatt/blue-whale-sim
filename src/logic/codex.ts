import { SymbolDatabase, Symbol } from '../types';
import { LIBRARY } from './library';

export class Codex {
  public symbols: SymbolDatabase;
  private byGlyph: Map<string, Symbol>;

  constructor(customDb?: SymbolDatabase) {
    this.symbols = customDb || LIBRARY;
    this.byGlyph = new Map(this.symbols.symbols.map(s => [s.glyph, s]));
  }

  public getSymbol(glyph: string): Symbol | undefined {
    return this.byGlyph.get(glyph);
  }

  public combine(a: string, b: string): string {
    const symA = this.getSymbol(a);
    const symB = this.getSymbol(b);

    if ((a === "🕳️" && b === "🕯️") || (a === "🕯️" && b === "🕳️")) {
      return "🕯️";
    }

    if (a === "🕳️" || b === "🕳️") return "🕳️";
    if (a === "🕯️" || b === "🕯️") return "🕯️";

    if (!symA || !symB) return a || b;

    const da = symA.domain;
    const db = symB.domain;

    if (da === db) {
      return symA.weight >= symB.weight ? a : b;
    }

    for (const bridge of this.symbols.cross_domain_bridges) {
      if ((bridge.from === da && bridge.to === db) || (bridge.from === db && bridge.to === da)) {
        return bridge.symbol;
      }
    }

    return symA.weight >= symB.weight ? a : b;
  }

  public compress(seq: string[], maxSteps: number = 20): string[][] {
    const steps: string[][] = [[...seq]];
    let current = [...seq];

    for (let s = 0; s < maxSteps; s++) {
      if (current.length <= 1) break;

      const next: string[] = [];
      let i = 0;
      while (i < current.length - 1) {
        next.push(this.combine(current[i], current[i + 1]));
        i += 2;
      }
      if (i < current.length) {
        next.push(current[i]);
      }

      current = next;
      steps.push([...current]);

      const unique = new Set(current);
      if ((unique.size === 1 && (unique.has("🕯️") || unique.has("🕳️")))) break;
    }
    return steps;
  }

  public mod97(seq: string[]): number {
    if (seq.length === 0) return 0;
    const total = seq.reduce((acc, glyph, idx) => {
      const sym = this.getSymbol(glyph);
      const weight = sym?.weight || 0;
      const posHarmonic = Math.pow(idx + 1, 1.618);
      return acc + (weight * 17) + (posHarmonic * 7);
    }, 0);
    
    return Math.floor(total) % 97;
  }

  public adversarialTest(seq: string[]): boolean {
    const testSeq = [...seq, "🕳️"];
    const final = this.compress(testSeq, 5).slice(-1)[0];
    return !final.includes("🕳️");
  }

  public findCompassMatch(seq: string[]): string {
    const m97 = this.mod97(seq);
    let bestMatch = "None";
    let minDiff = 5;

    for (const [dir, config] of Object.entries(this.symbols.compass)) {
      if (config.mod97 !== undefined) {
        const diff = Math.abs(config.mod97 - m97);
        if (diff < minDiff) {
          minDiff = diff;
          bestMatch = dir;
        }
      }
    }
    return bestMatch;
  }

  public resilience(seq: string[]): number {
    if (seq.length === 0) return 0;
    const lightCount = seq.filter(s => s === "🕯️").length;
    const totalWeight = seq.reduce((acc, s) => acc + (this.getSymbol(s)?.weight || 0), 0);
    return Math.min(1.0, (lightCount * 2 + totalWeight) / (seq.length * 5));
  }
}
