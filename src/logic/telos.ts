import { Codex } from './codex';
import { SimulationResults, SimulationStep } from '../types';
import { SeededRandom } from './random';

export interface TelosParams {
  alpha: number;
  gamma: number;
  delta: number;
  beta: number;
  lambda: number;
  eta: number;
  epsilon: number;
  threshold: number;
  temperature: number; // Added for stochasticity
  seed?: number; // Optional seed for reproducibility
}

export class Telos {
  private codex: Codex;
  private params: TelosParams;
  private rng: { next: () => number };

  constructor(codex: Codex, params?: Partial<TelosParams>) {
    this.codex = codex;
    this.params = {
      alpha: 0.5,
      gamma: 0.3,
      delta: 0.2,
      beta: 0.1,
      lambda: 0.618,
      eta: 0.3,
      epsilon: 0.05,
      threshold: 0.8,
      temperature: 1.0, // Default temperature
      ...params
    };

    if (this.params.seed !== undefined) {
      const seeded = new SeededRandom(this.params.seed);
      this.rng = { next: () => seeded.next() };
    } else {
      this.rng = { next: () => Math.random() };
    }
  }

  public information(seq: string[]): number {
    if (seq.length === 0) return 0;
    const counts = new Map<string, number>();
    seq.forEach(s => counts.set(s, (counts.get(s) || 0) + 1));
    const probs = Array.from(counts.values()).map(v => v / seq.length);
    return -probs.reduce((acc, p) => acc + p * Math.log(p + 1e-9), 0);
  }

  public coherence(seq: string[]): number {
    if (seq.length === 0) return 0;
    const distinct = new Set(seq).size;
    const total = this.codex.symbols.symbols.length;
    return 1.0 - (distinct / total);
  }

  public energy(seq: string[]): number {
    return seq.reduce((acc, s) => acc + (this.codex.getSymbol(s)?.weight || 0), 0);
  }

  public complexity(seq: string[]): number {
    return seq.length;
  }

  public telicScore(seq: string[]): number {
    const I = this.information(seq);
    const Phi = this.coherence(seq);
    const E = this.energy(seq);
    const K = this.complexity(seq);
    
    const baseScore = this.params.alpha * I + this.params.gamma * Phi + this.params.delta * E - this.params.beta * K;
    const couplingTerm = 0.2 * (I * Phi); 
    
    return baseScore + couplingTerm;
  }

  public duality(seq: string[]): number {
    if (seq.length === 0) return 0;
    const weights = seq.map(s => this.codex.getSymbol(s)?.weight || 0);
    return weights.reduce((a, b) => a + b, 0) / seq.length;
  }

  private generateProposals(seq: string[]): string[][] {
    const proposals: string[][] = [[...seq]];

    // Insert
    if (seq.length < 10) {
      const next = [...seq];
      const pos = Math.floor(this.rng.next() * (seq.length + 1));
      const allGlyphs = this.codex.symbols.symbols.map(s => s.glyph);
      next.splice(pos, 0, allGlyphs[Math.floor(this.rng.next() * allGlyphs.length)]);
      proposals.push(next);
    }

    // Delete
    if (seq.length > 1) {
      const next = [...seq];
      const pos = Math.floor(this.rng.next() * seq.length);
      next.splice(pos, 1);
      proposals.push(next);
    }

    // Combine
    if (seq.length >= 2) {
      const pos = Math.floor(this.rng.next() * (seq.length - 1));
      const combined = this.codex.combine(seq[pos], seq[pos + 1]);
      const next = [...seq.slice(0, pos), combined, ...seq.slice(pos + 2)];
      proposals.push(next);
    }

    // Swap
    if (seq.length >= 2) {
      const next = [...seq];
      const idx1 = Math.floor(this.rng.next() * seq.length);
      let idx2 = Math.floor(this.rng.next() * seq.length);
      while (idx1 === idx2) idx2 = Math.floor(this.rng.next() * seq.length);
      [next[idx1], next[idx2]] = [next[idx2], next[idx1]];
      proposals.push(next);
    }

    return proposals;
  }

  public evolveStep(seq: string[], step: number, dHist: number[], currentTemp: number): { nextSeq: string[], dNew: number, tScore: number } {
    const proposals = this.generateProposals(seq);
    const currentScore = this.telicScore(seq);
    
    let bestIdx = 0;
    let bestScore = -Infinity;
    
    const randomIdx = Math.floor(this.rng.next() * proposals.length);
    const candidate = proposals[randomIdx];
    const candidateScore = this.telicScore(candidate);
    
    const deltaScore = candidateScore - currentScore;
    const acceptanceProb = Math.exp(deltaScore / (currentTemp + 1e-6));
    
    let nextSeq: string[];
    let tScore: number;

    if (deltaScore > 0 || this.rng.next() < acceptanceProb) {
      nextSeq = candidate;
      tScore = candidateScore;
    } else {
      nextSeq = seq;
      tScore = currentScore;
    }

    const D = this.duality(nextSeq);
    const C = dHist.length >= 1 ? D - dHist[dHist.length - 1] : 0;
    const N = 0;
    const noise = (this.rng.next() * 2 - 1) * this.params.epsilon;
    
    let dNew = D + this.params.lambda * C + this.params.eta * N + noise;
    dNew = Math.max(0, Math.min(2, dNew));

    return { nextSeq, dNew, tScore };
  }

  public run(initialSeq: string[], steps: number = 30): SimulationResults {
    let current = [...initialSeq];
    const history: SimulationStep[] = [{
      sequence: [...current],
      duality: this.duality(current),
      telicScore: this.telicScore(current),
      step: 0,
      mod97: this.codex.mod97(current),
      adversarialPassed: this.codex.adversarialTest(current),
      compassMatch: this.codex.findCompassMatch(current),
      resilience: this.codex.resilience(current)
    }];

    let observerEmerged = false;
    let observerStep: number | undefined;

    for (let t = 1; t <= steps; t++) {
      const dHist = history.map(h => h.duality);
      const currentTemp = this.params.temperature * Math.pow(0.95, t);
      
      const { nextSeq, dNew, tScore } = this.evolveStep(current, t, dHist, currentTemp);
      
      current = nextSeq;
      history.push({
        sequence: [...current],
        duality: dNew,
        telicScore: tScore,
        step: t,
        mod97: this.codex.mod97(current),
        adversarialPassed: this.codex.adversarialTest(current),
        compassMatch: this.codex.findCompassMatch(current),
        resilience: this.codex.resilience(current)
      });

      if (dNew >= this.params.threshold && !observerEmerged) {
        observerEmerged = true;
        observerStep = t;
      }

      const unique = new Set(current);
      if (unique.size === 1 && (unique.has("🕯️") || unique.has("🕳️"))) {
        if (this.rng.next() > currentTemp) break;
      }
    }

    return { history, observerEmerged, observerStep };
  }
}
