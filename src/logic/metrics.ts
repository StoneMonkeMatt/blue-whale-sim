import { Codex } from './codex';
import { SimulationStep, MetricsData } from '../types';

export class Metrics {
  public static compute(initialSeq: string[], history: SimulationStep[], codex: Codex): MetricsData {
    const finalStep = history[history.length - 1];
    const finalSeq = finalStep.sequence;

    return {
      convergenceIters: this.convergenceIterations(history),
      contractionRate: this.contractionRate(history),
      fidelity: this.fidelity(initialSeq, finalSeq, codex),
      cfIndex: this.cfIndex(finalSeq, codex),
      mod97Final: codex.mod97(finalSeq),
      adversarialPassed: codex.adversarialTest(finalSeq),
      observerEmerged: history.some(h => h.duality >= 0.8), // Using default threshold
      resilience: codex.resilience(finalSeq)
    };
  }

  private static convergenceIterations(history: SimulationStep[]): number {
    for (let i = 0; i < history.length; i++) {
      if (history[i].sequence.length <= 1) return i;
    }
    return history.length - 1;
  }

  private static contractionRate(history: SimulationStep[]): number {
    const start = history[0].sequence.length;
    const end = history[history.length - 1].sequence.length;
    return start > 0 ? end / start : 0;
  }

  private static fidelity(original: string[], final: string[], codex: Codex): number {
    const origWeight = original.reduce((acc, s) => acc + (codex.getSymbol(s)?.weight || 0), 0);
    const finalWeight = final.reduce((acc, s) => acc + (codex.getSymbol(s)?.weight || 0), 0);
    return origWeight === 0 ? 1.0 : finalWeight / origWeight;
  }

  private static cfIndex(seq: string[], codex: Codex): number {
    if (seq.length === 0) return 0;
    
    const counts = new Map<string, number>();
    seq.forEach(s => counts.set(s, (counts.get(s) || 0) + 1));
    const probs = Array.from(counts.values()).map(v => v / seq.length);
    const entropy = -probs.reduce((acc, p) => acc + p * Math.log(p + 1e-9), 0);

    const distinct = new Set(seq).size;
    const total = codex.symbols.symbols.length;
    const coherence = 1.0 - (distinct / total);

    const maxEntropy = seq.length > 1 ? Math.log(seq.length) : 1.0;
    const entropyRet = entropy / maxEntropy;

    return entropyRet * coherence;
  }
}
