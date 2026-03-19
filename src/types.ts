export interface Symbol {
  glyph: string;
  meaning: string;
  domain: string;
  weight: number;
  opposites: string[];
}

export interface DomainMap {
  [key: string]: string[];
}

export interface CompassDirection {
  symbols: string[];
  mod97?: number;
  mod93?: number;
}

export interface Compass {
  [key: string]: CompassDirection;
}

export interface Bridge {
  from: string;
  to: string;
  symbol: string;
}

export interface SymbolDatabase {
  symbols: Symbol[];
  domains: DomainMap;
  compass: Compass;
  cross_domain_bridges: Bridge[];
}

export interface SimulationStep {
  sequence: string[];
  duality: number;
  telicScore: number;
  step: number;
  mod97?: number;
  adversarialPassed?: boolean;
  compassMatch?: string;
  resilience?: number;
}

export interface SimulationResults {
  history: SimulationStep[];
  observerEmerged: boolean;
  observerStep?: number;
  originalText?: string;
  seed?: number;
}

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'grok' | 'deepseek';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  rememberKey: boolean;
}

export interface MetricsData {
  convergenceIters: number;
  contractionRate: number;
  fidelity: number;
  cfIndex: number;
  mod97Final: number;
  adversarialPassed: boolean;
  observerEmerged: boolean;
  resilience: number;
}
