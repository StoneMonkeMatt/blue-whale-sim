/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Activity, Database, Zap, Shield, Target, Compass as CompassIcon, 
  ChevronRight, Play, RefreshCw, Info, Settings2, BarChart3,
  Layers, Triangle as TriangleIcon, Workflow, CheckCircle2,
  Lightbulb, Cpu, Scale, Brain, FileText, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Codex } from './logic/codex';
import { Telos, TelosParams } from './logic/telos';
import { Metrics } from './logic/metrics';
import { distillTextToSymbols } from './services/aiService';
import { SimulationResults, MetricsData, Symbol, AIConfig, AIProvider } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const codex = useMemo(() => new Codex(), []);
  const [narrative, setNarrative] = useState<string[]>(["🌪️", "🐋", "🎯", "⚓", "💀"]);
  const [params, setParams] = useState<TelosParams>({
    alpha: 0.5,
    gamma: 0.3,
    delta: 0.2,
    beta: 0.1,
    lambda: 0.618,
    eta: 0.3,
    epsilon: 0.05,
    threshold: 0.8,
    temperature: 1.0,
    seed: Math.floor(Math.random() * 1000000)
  });

  const handleRandomize = () => {
    const allGlyphs = codex.symbols.symbols.map(s => s.glyph);
    const length = 3 + Math.floor(Math.random() * 5);
    const randomSeq = Array.from({ length }, () => allGlyphs[Math.floor(Math.random() * allGlyphs.length)]);
    const newSeed = Math.floor(Math.random() * 1000000);
    const nextParams = { ...params, seed: newSeed };
    
    setNarrative(randomSeq);
    setParams(nextParams);
    
    // Auto-run simulation with fresh params
    const telos = new Telos(codex, nextParams);
    const simResults = telos.run(randomSeq, simSteps);
    setResults({ ...simResults, seed: newSeed });
    setMetrics(Metrics.compute(randomSeq, simResults.history, codex));
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  const handleHardReset = () => {
    const defaultNarrative = ["🌪️", "🐋", "🎯", "⚓", "💀"];
    const newSeed = Math.floor(Math.random() * 1000000);
    const defaultParams = {
      alpha: 0.5,
      gamma: 0.3,
      delta: 0.2,
      beta: 0.1,
      lambda: 0.618,
      eta: 0.3,
      epsilon: 0.05,
      threshold: 0.8,
      temperature: 1.0,
      seed: newSeed
    };
    
    setNarrative(defaultNarrative);
    setParams(defaultParams);
    setInputText("");
    setResults(null);
    setMetrics(null);
    setCurrentStepIdx(0);
    setIsPlaying(false);
    
    // Run default simulation
    const telos = new Telos(codex, defaultParams);
    const simResults = telos.run(defaultNarrative, simSteps);
    setResults({ ...simResults, seed: newSeed });
    setMetrics(Metrics.compute(defaultNarrative, simResults.history, codex));
    setCurrentStepIdx(simResults.history.length - 1);
  };

  const clearNarrative = () => {
    setNarrative([]);
    setResults(null);
    setMetrics(null);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [activeTab, setActiveTab] = useState<'simulation' | 'ontology' | 'metrics' | 'theory' | 'vision' | 'innovations'>('simulation');
  const [simSteps, setSimSteps] = useState(60);
  const [inputText, setInputText] = useState("");
  const [isDistilling, setIsDistilling] = useState(false);
  const [distillStatus, setDistillStatus] = useState("");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && results) {
      interval = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev >= results.history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, results]);

  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('blue_whale_ai_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, apiKey: '' }; // Don't restore API key from localStorage for security by default
      } catch (e) {
        console.error("Failed to parse saved AI config:", e);
      }
    }
    return {
      provider: 'gemini',
      apiKey: '',
      model: '',
      rememberKey: false
    };
  });

  useEffect(() => {
    if (aiConfig.rememberKey && aiConfig.apiKey) {
      localStorage.setItem('blue_whale_ai_config', JSON.stringify({
        ...aiConfig,
        apiKey: aiConfig.apiKey // Storing in localStorage as per user opt-in
      }));
    } else {
      const { apiKey, ...rest } = aiConfig;
      localStorage.setItem('blue_whale_ai_config', JSON.stringify(rest));
    }
  }, [aiConfig]);

  const runSimulation = () => {
    // Ensure we use a fresh seed if we're re-running
    const newSeed = Math.floor(Math.random() * 1000000);
    const nextParams = { ...params, seed: newSeed };
    setParams(nextParams);
    
    const telos = new Telos(codex, nextParams);
    const simResults = telos.run(narrative, simSteps);
    setResults({ ...simResults, seed: newSeed });
    setMetrics(Metrics.compute(narrative, simResults.history, codex));
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  const handleExport = () => {
    if (!results) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      parameters: params,
      metrics: metrics,
      seed: results.seed,
      originalText: results.originalText,
      observerEmerged: results.observerEmerged,
      observerStep: results.observerStep,
      history: results.history,
      timestamp: new Date().toISOString()
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `blue_whale_experiment_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDistill = async () => {
    if (!inputText.trim()) return;
    if (!aiConfig.apiKey) {
      setDistillStatus("Add your API key to enable AI features");
      setTimeout(() => setDistillStatus(""), 3000);
      return;
    }

    setIsDistilling(true);
    setDistillStatus(`Distilling semantic essence via ${aiConfig.provider}...`);
    setResults(null);
    setCurrentStepIdx(0);
    setIsPlaying(false);
    
    const newSeed = Math.floor(Math.random() * 1000000);
    const nextParams = { ...params, seed: newSeed };
    setParams(nextParams);
    
    try {
      const symbols = await distillTextToSymbols(inputText, codex.symbols.symbols, aiConfig);
      if (symbols.length > 0) {
        setNarrative(symbols);
        setDistillStatus("Running Telos simulation...");
        
        // Allow UI to update before heavy simulation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const telos = new Telos(codex, nextParams);
        const simResults = telos.run(symbols, simSteps);
        const resultsWithText = { ...simResults, originalText: inputText, seed: newSeed };
        
        // Reset step index BEFORE setting results to ensure playback starts at 0
        setCurrentStepIdx(0);
        setResults(resultsWithText);
        setMetrics(Metrics.compute(symbols, simResults.history, codex));
        setIsPlaying(true); // Auto-play after distillation
        setDistillStatus(""); // Clear status on success
      } else {
        setDistillStatus("No symbols found. Try a different passage.");
        setTimeout(() => setDistillStatus(""), 3000);
      }
    } catch (error: any) {
      console.error("Distillation error:", error);
      setDistillStatus(error.message || "Error during distillation.");
      setTimeout(() => setDistillStatus(""), 5000);
    } finally {
      setIsDistilling(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const addSymbol = (glyph: string) => {
    if (narrative.length < 10) {
      setNarrative([...narrative, glyph]);
    }
  };

  const removeSymbol = (index: number) => {
    const next = [...narrative];
    next.splice(index, 1);
    setNarrative(next);
  };

  const chartData = useMemo(() => {
    if (!results) return [];
    return results.history.map(h => ({
      step: h.step,
      telic: parseFloat(h.telicScore.toFixed(4)),
      duality: parseFloat(h.duality.toFixed(4)),
      length: h.sequence.length
    }));
  }, [results]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 p-4 flex items-center justify-between bg-ocean-950/40 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ rotate: -20, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              className="w-10 h-10 bg-cyan-500 flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              <Zap className="text-ocean-950 w-6 h-6 fill-current" />
            </motion.div>
            <div>
              <h1 className="font-bold text-lg tracking-tight uppercase glow-text-cyan">The Compass</h1>
              <p className="text-[10px] opacity-40 font-mono tracking-widest">GLOBAL MEANING INFRASTRUCTURE // BW-REF.0.9</p>
            </div>
            <button 
              onClick={handleHardReset}
              className="ml-4 p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all uppercase text-[8px] font-bold tracking-widest"
              title="Hard Reset Application"
            >
              Hard Reset
            </button>
          </div>
        <nav className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {(['simulation', 'ontology', 'metrics', 'theory', 'innovations', 'vision'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest",
                activeTab === tab 
                  ? "bg-cyan-500 text-ocean-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Sidebar Controls */}
        <div className="lg:col-span-3 space-y-6">
          <section className="glass-panel p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">AI Configuration</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Provider</label>
                <select 
                  value={aiConfig.provider}
                  onChange={(e) => {
                    const newProvider = e.target.value as AIProvider;
                    setAiConfig({ 
                      ...aiConfig, 
                      provider: newProvider,
                      model: '' // Clear model to use provider defaults
                    });
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI (ChatGPT)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="grok">Grok (xAI)</option>
                  <option value="deepseek">DeepSeek</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">API Key</label>
                <input 
                  type="password"
                  value={aiConfig.apiKey}
                  onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                  placeholder="Enter your API key"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Model (Optional)</label>
                <input 
                  type="text"
                  value={aiConfig.model}
                  onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                  placeholder={
                    aiConfig.provider === 'gemini' ? "gemini-3-flash-preview" : 
                    aiConfig.provider === 'openai' ? "gpt-4o" :
                    aiConfig.provider === 'anthropic' ? "claude-3-5-sonnet-latest" :
                    aiConfig.provider === 'grok' ? "grok-2-latest" :
                    "deepseek-chat"
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox"
                  id="remember-key"
                  checked={aiConfig.rememberKey}
                  onChange={(e) => setAiConfig({ ...aiConfig, rememberKey: e.target.checked })}
                  className="w-3 h-3 rounded bg-white/5 border-white/10 accent-cyan-400"
                />
                <label htmlFor="remember-key" className="text-[9px] font-bold uppercase tracking-widest opacity-40 cursor-pointer">
                  Remember my API key on this device
                </label>
              </div>
            </div>
          </section>

          <section className="glass-panel p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Settings2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Parameters</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(params).filter(([key]) => key !== 'seed').map(([key, value]) => {
                const labels: Record<string, string> = {
                  alpha: "Information Weight",
                  gamma: "Coherence Weight",
                  delta: "Energy Weight",
                  beta: "Complexity Penalty",
                  lambda: "Coupling Factor"
                };
                const tooltips: Record<string, string> = {
                  alpha: "Influences how much the system values information richness.",
                  gamma: "Determines the importance of semantic alignment between symbols.",
                  delta: "Controls the dynamic potential and drive within the sequence.",
                  beta: "Penalizes overly convoluted or redundant symbolic structures.",
                  lambda: "Adjusts the strength of interaction between information and coherence."
                };
                
                const label = labels[key] || key;
                const tooltip = tooltips[key];

                return (
                  <div key={key} className="space-y-2 group relative">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                      <span className="opacity-40 flex items-center gap-1">
                        {label}
                        {tooltip && <Info className="w-2.5 h-2.5 opacity-40" title={tooltip} />}
                      </span>
                      <span className="text-cyan-400 font-bold">{value}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={key === 'lambda' ? "2" : "1"}
                      step="0.01"
                      value={value}
                      onChange={(e) => setParams({ ...params, [key]: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                );
              })}

              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                  <span className="opacity-40">Experiment Seed</span>
                  <span className="text-cyan-400 font-bold">{params.seed}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={params.seed || 0}
                    onChange={(e) => setParams({ ...params, seed: parseInt(e.target.value) || 0 })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button 
                    onClick={() => setParams({ ...params, seed: Math.floor(Math.random() * 1000000) })}
                    className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-cyan-400 transition-colors"
                    title="Generate Random Seed"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Simulation Depth</label>
                  <span className="text-[10px] font-mono font-bold text-cyan-400">{simSteps} steps</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={simSteps}
                  onChange={(e) => setSimSteps(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <p className="text-[9px] opacity-30 italic leading-relaxed">Higher depth allows for deeper convergence in complex narratives.</p>
              </div>
            </div>
            <button
              onClick={runSimulation}
              className="w-full bg-cyan-500 text-ocean-950 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all uppercase text-[10px] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Re-Simulate
            </button>
          </section>

          <section className="glass-panel p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Database className="w-4 h-4 text-cyan-400" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Quick Symbols</h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {codex.symbols.symbols.map(s => (
                <button
                  key={s.glyph}
                  onClick={() => addSymbol(s.glyph)}
                  title={s.meaning}
                  className="symbol-btn"
                >
                  {s.glyph}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Narrative Input */}
          <section className="glass-panel p-6 border-cyan-500/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CompassIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Initial Narrative</h2>
              </div>
              <div className="flex items-center gap-6">
                <button 
                  onClick={clearNarrative}
                  className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-all"
                >
                  Clear
                </button>
                <button 
                  onClick={handleRandomize}
                  className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/60 hover:text-cyan-400 flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  Randomize
                </button>
                <span className="text-[10px] font-mono opacity-30 uppercase tracking-widest">Max 10 symbols</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 min-h-[100px] p-6 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
              <AnimatePresence mode='popLayout'>
                {narrative.map((glyph, i) => (
                  <motion.button
                    key={`${glyph}-${i}`}
                    layout
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    onClick={() => removeSymbol(i)}
                    className="text-5xl cursor-pointer drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    {glyph}
                  </motion.button>
                ))}
              </AnimatePresence>
              {narrative.length === 0 && (
                <p className="text-[10px] font-bold tracking-[0.3em] opacity-20 uppercase">Select symbols to begin</p>
              )}
            </div>
          </section>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'simulation' && (
              <div className="space-y-6">
                {/* Semantic Distillation Section */}
                <section className="glass-panel p-6 space-y-4 border-black/10 border-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-black" />
                      <h3 className="font-bold uppercase text-xs tracking-widest">Semantic Distillation</h3>
                    </div>
                    <span className="text-[10px] font-mono opacity-40 uppercase">Primary Input Method</span>
                  </div>
                  <div className="space-y-3">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste a story, poem, or any human/AI writing here to distill it into a symbolic narrative..."
                      className="w-full h-64 bg-black/5 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-y transition-all font-serif leading-relaxed"
                    />
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-mono opacity-40 uppercase">Chars: {inputText.length}</span>
                      <span className="text-[10px] font-mono opacity-40 uppercase">V9 Context Window Active</span>
                    </div>
                    <button
                      onClick={handleDistill}
                      disabled={isDistilling || !inputText.trim()}
                      className={cn(
                        "w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all uppercase text-xs font-bold tracking-widest",
                        isDistilling ? "bg-black/20 cursor-not-allowed" : "bg-black text-white hover:bg-black/80"
                      )}
                    >
                      {isDistilling ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          {distillStatus || "Distilling Meaning..."}
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Distill Narrative
                        </>
                      )}
                    </button>
                    {distillStatus && !isDistilling && (
                      <p className="text-[10px] text-center font-mono opacity-60 animate-pulse">{distillStatus}</p>
                    )}
                  </div>
                </section>

                {/* Simulation Results Display */}
                {results && (
                  <div className="space-y-6">
                    {results.originalText && (
                      <div className="glass-panel p-4 bg-black/5 border-black/5">
                        <div className="flex items-center gap-2 mb-2 opacity-40">
                          <FileText className="w-3 h-3" />
                          <span className="text-[10px] font-mono uppercase tracking-wider">Source Distillation</span>
                        </div>
                        <p className="text-xs font-serif italic text-black/60 line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                          "{results.originalText}"
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50">Evolution Timeline</h3>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setIsPlaying(!isPlaying);
                          }}
                          className="p-1 hover:bg-black/5 rounded transition-colors text-cyan-600"
                          title={isPlaying ? "Pause" : "Play Evolution"}
                        >
                          {isPlaying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>
                        <button 
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentStepIdx(Math.max(0, currentStepIdx - 1));
                          }}
                          className="p-1 hover:bg-black/5 rounded transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        <span className="text-[10px] font-mono font-bold">Step {currentStepIdx} / {results?.history.length ? results.history.length - 1 : 0}</span>
                        <button 
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentStepIdx(Math.min((results?.history.length || 1) - 1, currentStepIdx + 1));
                          }}
                          className="p-1 hover:bg-black/5 rounded transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 min-h-[100px] items-center justify-center bg-black/5 rounded-xl p-4 border border-black/5">
                      <AnimatePresence mode='popLayout'>
                        {results?.history[currentStepIdx]?.sequence.map((glyph, i) => (
                          <motion.span
                            key={`${glyph}-${i}-${currentStepIdx}`}
                            initial={{ scale: 0, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="text-3xl"
                          >
                            {glyph}
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase font-bold opacity-40">Telic Score</span>
                        <div className="text-lg font-bold font-mono">{results?.history[currentStepIdx]?.telicScore.toFixed(4)}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase font-bold opacity-40">Resilience</span>
                        <div className="text-lg font-bold font-mono text-blue-600">{(results?.history[currentStepIdx]?.resilience || 0).toFixed(3)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/5">
                      <div className="space-y-1">
                        <span className="text-[7px] uppercase font-bold opacity-40">Mod97</span>
                        <div className="text-xs font-mono font-bold">Φ-{results?.history[currentStepIdx]?.mod97?.toString().padStart(2, '0')}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[7px] uppercase font-bold opacity-40">Adversarial</span>
                        <div className={cn("text-[8px] font-bold uppercase", results?.history[currentStepIdx]?.adversarialPassed ? "text-emerald-600" : "text-red-500")}>
                          {results?.history[currentStepIdx]?.adversarialPassed ? "Passed" : "Failed"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[7px] uppercase font-bold opacity-40">Compass</span>
                        <div className="text-[8px] font-bold uppercase opacity-60">{results?.history[currentStepIdx]?.compassMatch}</div>
                      </div>
                    </div>

                    <input 
                      type="range"
                      min="0"
                      max={(results?.history.length || 1) - 1}
                      value={currentStepIdx}
                      onChange={(e) => setCurrentStepIdx(parseInt(e.target.value))}
                      className="w-full h-1 bg-black/10 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>

                  <div className="glass-panel p-4 h-[350px]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-50">Telic & Duality Evolution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
                        <XAxis dataKey="step" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #00000010', fontSize: '10px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase' }} />
                        <Line type="monotone" dataKey="telic" stroke="#000" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="duality" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel p-4 h-[300px]">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-50">Compression Dynamics</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
                      <XAxis dataKey="step" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #00000010', fontSize: '10px' }}
                      />
                      <Area type="step" dataKey="length" stroke="#000" fill="#00000005" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-panel">
                  <div className="p-4 border-b border-black/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50">Compression History</h3>
                        {results?.observerEmerged && (
                          <div className="flex items-center gap-2 text-emerald-600 animate-pulse">
                            <Activity className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Observer Emerged @ Step {results.observerStep}</span>
                          </div>
                        )}
                        {results?.history.length && results.history.length < simSteps + 1 && (
                          <div className="flex items-center gap-2 text-amber-500">
                            <Target className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Attractor Reached @ Step {results.history.length - 1}</span>
                          </div>
                        )}
                      </div>
                    <button 
                      onClick={handleExport}
                      className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-1 transition-opacity"
                    >
                      <Database className="w-3 h-3" />
                      Export JSON
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    <div className="data-row bg-black/5 grid-cols-[40px_1fr_60px_60px_60px_60px_60px_80px]">
                      <span className="col-header">Step</span>
                      <span className="col-header">Sequence</span>
                      <span className="col-header text-right">Telic</span>
                      <span className="col-header text-right">Resil</span>
                      <span className="col-header text-right">M97</span>
                      <span className="col-header text-center">Adv</span>
                      <span className="col-header text-right">Compass</span>
                    </div>
                    {results?.history.map((step, i) => (
                      <div key={i} className="data-row grid-cols-[40px_1fr_60px_60px_60px_60px_60px_80px] hover:bg-black/5 transition-colors">
                        <span className="data-value text-[10px] opacity-40">{step.step}</span>
                        <span className="text-xl tracking-tighter">{step.sequence.join('')}</span>
                        <span className="data-value text-[10px] text-right">{step.telicScore.toFixed(4)}</span>
                        <span className="data-value text-[10px] text-right text-blue-600">{step.resilience?.toFixed(3)}</span>
                        <span className="data-value text-[10px] text-right opacity-60">{step.mod97}</span>
                        <span className={cn("data-value text-[8px] text-center font-bold uppercase", step.adversarialPassed ? "text-emerald-600" : "text-red-500")}>
                          {step.adversarialPassed ? "✓" : "✗"}
                        </span>
                        <span className="data-value text-[9px] text-right opacity-60 uppercase font-bold">{step.compassMatch}</span>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

            {activeTab === 'ontology' && (
              <div className="glass-panel">
                <div className="p-4 border-b border-black/5">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50">Symbol Ontology (V9 Codex)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/5">
                        <th className="p-4 col-header">Glyph</th>
                        <th className="p-4 col-header">Meaning</th>
                        <th className="p-4 col-header">Domain</th>
                        <th className="p-4 col-header text-right">Weight</th>
                        <th className="p-4 col-header">Opposites</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codex.symbols.symbols.map(s => (
                        <tr key={s.glyph} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                          <td className="p-4 text-2xl">{s.glyph}</td>
                          <td className="p-4 text-xs font-medium">{s.meaning}</td>
                          <td className="p-4 text-[10px] font-mono uppercase opacity-60">{s.domain}</td>
                          <td className="p-4 text-right data-value text-xs">{s.weight}</td>
                          <td className="p-4 text-xs opacity-40">{s.opposites.join(', ') || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'metrics' && metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <MetricCard 
                  title="Convergence" 
                  value={metrics.convergenceIters} 
                  unit="steps" 
                  icon={<Target className="w-4 h-4" />} 
                  desc="Steps until sequence stability"
                />
                <MetricCard 
                  title="Contraction" 
                  value={(metrics.contractionRate * 100).toFixed(1)} 
                  unit="%" 
                  icon={<Zap className="w-4 h-4" />} 
                  desc="Final length vs initial length"
                />
                <MetricCard 
                  title="Fidelity" 
                  value={metrics.fidelity.toFixed(3)} 
                  unit="ratio" 
                  icon={<Shield className="w-4 h-4" />} 
                  desc="Weight preservation index"
                />
                <MetricCard 
                  title="CF Index" 
                  value={metrics.cfIndex.toFixed(3)} 
                  unit="index" 
                  icon={<BarChart3 className="w-4 h-4" />} 
                  desc="Codex Fidelity (Entropy × Coherence)"
                />
                <MetricCard 
                  title="Resonance Signature" 
                  value={`Φ-${metrics.mod97Final.toString().padStart(2, '0')}`} 
                  unit="MOD97" 
                  icon={<CompassIcon className="w-4 h-4" />} 
                  desc="Unique symbolic fingerprint of the final narrative state."
                  status={metrics.mod97Final > 50 ? 'success' : undefined}
                />
                <MetricCard 
                  title="Resilience" 
                  value={metrics.resilience.toFixed(3)} 
                  unit="index" 
                  icon={<Shield className="w-4 h-4" />} 
                  desc="Ability to survive Void confrontation"
                  status={metrics.resilience > 0.5 ? 'success' : undefined}
                />
                <MetricCard 
                  title="Adversarial" 
                  value={metrics.adversarialPassed ? "PASSED" : "FAILED"} 
                  unit="" 
                  icon={<Activity className="w-4 h-4" />} 
                  desc="Stability against Void negation"
                  status={metrics.adversarialPassed ? 'success' : 'error'}
                />
              </div>
            )}

            {activeTab === 'theory' && (
              <div className="space-y-16 max-w-5xl mx-auto pb-32">
                <header className="text-center space-y-6">
                  <div className="inline-block px-4 py-1.5 bg-cyan-500 text-ocean-950 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-4 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                    Theoretical Framework
                  </div>
                  <h2 className="text-6xl font-bold tracking-tighter uppercase glow-text-cyan">The V9 Codex Ontology</h2>
                  <p className="text-xl text-white/40 max-w-3xl mx-auto leading-relaxed">
                    A unified simulation environment merging the Codex pipeline, Telic evolution, and Semantic attractors.
                  </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <section className="glass-panel p-8 space-y-6 border-white/5 group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-4 text-cyan-400">
                      <div className="p-3 bg-cyan-500/10 rounded-2xl">
                        <Database className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold uppercase text-[10px] tracking-[0.3em]">1. Codex Pipeline</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-white/40 font-medium">
                      Manages the symbol ontology and compression rules. Symbols are combined based on domain rules 
                      and cross-domain relationships. The goal is to reach a stable state, 
                      often represented by the Semantic Attractor (🕯️).
                    </p>
                  </section>

                  <section className="glass-panel p-8 space-y-6 border-white/5 group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-4 text-cyan-400">
                      <div className="p-3 bg-cyan-500/10 rounded-2xl">
                        <Zap className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold uppercase text-[10px] tracking-[0.3em]">2. Telic Evolution</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-white/40 font-medium">
                      The optimization engine uses the Telic Objective Function (Unified Equation v1.1) to evolve 
                      narratives. It balances Information (I), Coherence (Φ), Energy (E), and Complexity (K).
                    </p>
                    <div className="bg-white/5 p-6 rounded-2xl font-mono text-[10px] space-y-2 border border-white/5">
                      <p className="text-cyan-400">T = αI + γΦ + δE - βK + λ(I · Φ)</p>
                      <p className="text-white/20 italic">// Nonlinear coupling λ(I · Φ) represents multiplicative interaction</p>
                    </div>
                  </section>

                  <section className="glass-panel p-8 space-y-6 border-white/5 group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-4 text-cyan-400">
                      <div className="p-3 bg-cyan-500/10 rounded-2xl">
                        <Activity className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold uppercase text-[10px] tracking-[0.3em]">3. Observer Emergence</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-white/40 font-medium">
                      Duality (D) represents the average "weight" or awareness of a sequence. 
                      When Duality crosses a critical threshold (typically 0.8), an "Observer" is said to emerge (○→●).
                    </p>
                    <div className="bg-white/5 p-6 rounded-2xl font-mono text-[10px] space-y-2 border border-white/5">
                      <p className="text-cyan-400">Dₜ₊₁ = Dₜ + λC + ηN + ε</p>
                      <p className="text-white/20 italic">// λ: telic bias (≈0.618), C: context, η: binding, ε: noise</p>
                    </div>
                  </section>

                  <section className="glass-panel p-8 space-y-6 border-white/5 group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-4 text-cyan-400">
                      <div className="p-3 bg-cyan-500/10 rounded-2xl">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold uppercase text-[10px] tracking-[0.3em]">4. Adversarial Dualism</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-white/40 font-medium">
                      The simulation includes a test where sequences are combined with the Void symbol (🕳️) 
                      to observe whether meaning persists.
                    </p>
                  </section>

                  <section className="glass-panel p-8 space-y-6 border-white/5 group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-4 text-cyan-400">
                      <div className="p-3 bg-cyan-500/10 rounded-2xl">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold uppercase text-[10px] tracking-[0.3em]">5. Reverse Evolution</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-white/40 font-medium">
                      Infers past conditions from present observations by weighting paths according to telic utility.
                    </p>
                  </section>

                  <section className="glass-panel p-8 space-y-6 border-white/5 group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-4 text-cyan-400">
                      <div className="p-3 bg-cyan-500/10 rounded-2xl">
                        <Info className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold uppercase text-[10px] tracking-[0.3em]">6. Golden Ratio Bias</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-white/40 font-medium">
                      The coupling factor λ defaults to 0.618, a value that emerged through extensive 
                      experimentation with system behavior.
                    </p>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-20 border-t border-white/5">
                  <section className="space-y-10">
                    <div className="flex items-center gap-4 text-cyan-400">
                      <Layers className="w-8 h-8" />
                      <h4 className="font-bold uppercase text-xs tracking-[0.4em]">The Five-Layer Pyramid</h4>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      {[
                        { label: 'Verification', color: 'bg-cyan-500 text-ocean-950 shadow-[0_0_30px_rgba(34,211,238,0.3)]' },
                        { label: 'Measurement', color: 'bg-cyan-600 text-white' },
                        { label: 'Information', color: 'bg-ocean-800 text-white/80' },
                        { label: 'Systems', color: 'bg-ocean-900 text-white/60' },
                        { label: 'Reality', color: 'bg-ocean-950 text-white/40 border border-white/5' },
                      ].map((layer, i) => (
                        <div 
                          key={layer.label}
                          className={cn(
                            "w-full py-4 text-center text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:scale-105 rounded-xl",
                            layer.color
                          )}
                          style={{ width: `${100 - i * 12}%` }}
                        >
                          {layer.label}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-white/30 leading-relaxed text-center uppercase tracking-widest">
                      A dependency graph where each layer rests on the one below and enables the one above.
                    </p>
                  </section>

                  <section className="space-y-10">
                    <div className="flex items-center gap-4 text-cyan-400">
                      <TriangleIcon className="w-8 h-8" />
                      <h4 className="font-bold uppercase text-xs tracking-[0.4em]">The Research Triangle</h4>
                    </div>
                    <div className="relative h-64 flex items-center justify-center">
                      <div className="absolute top-0 font-bold text-[10px] uppercase tracking-[0.5em] text-white/40">Reality</div>
                      <div className="absolute bottom-0 left-0 font-bold text-[10px] uppercase tracking-[0.5em] text-white/40">Systems</div>
                      <div className="absolute bottom-0 right-0 font-bold text-[10px] uppercase tracking-[0.5em] text-white/40">Information</div>
                      <svg className="w-48 h-48 text-cyan-500/20" viewBox="0 0 100 100">
                        <polygon points="50,5 95,95 5,95" fill="none" stroke="currentColor" strokeWidth="1" />
                        <circle cx="50" cy="5" r="4" fill="currentColor" className="animate-pulse" />
                        <circle cx="95" cy="95" r="4" fill="currentColor" className="animate-pulse" />
                        <circle cx="5" cy="95" r="4" fill="currentColor" className="animate-pulse" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-cyan-500 rounded-full animate-pulse blur-md opacity-50" />
                        <div className="w-3 h-3 bg-white rounded-full relative z-10" />
                      </div>
                    </div>
                    <p className="text-[10px] text-white/30 leading-relaxed text-center uppercase tracking-widest">
                      Emergence arises only when all three vertices interact. It is the product of their interaction.
                    </p>
                  </section>
                </div>

                <section className="feature-card-white p-12 space-y-8">
                  <h4 className="font-bold uppercase text-[10px] tracking-[0.4em] mb-4 flex items-center gap-3 text-ocean-900/40">
                    <Info className="w-5 h-5 text-cyan-500" />
                    Research Summary
                  </h4>
                  <p className="text-2xl leading-relaxed text-ocean-900 font-medium italic tracking-tight">
                    "The simulation compresses symbolic narratives toward stable configurations. 
                    The candle (🕯️) often appears as a recurring pattern in these compressed forms."
                  </p>
                </section>
              </div>
            )}

            {activeTab === 'innovations' && (
              <div className="space-y-20 max-w-6xl mx-auto pb-32">
                <header className="text-center space-y-6">
                  <div className="inline-block px-4 py-1.5 bg-cyan-500 text-ocean-950 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-4 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                    Research Breakthroughs
                  </div>
                  <h2 className="text-6xl font-bold tracking-tighter uppercase glow-text-cyan">The Blue Whale Innovations</h2>
                  <p className="text-xl text-white/40 max-w-3xl mx-auto leading-relaxed">
                    A formal architecture for meaning. These are the mathematical structures and research findings that explore the dynamics of collective intelligence.
                  </p>
                </header>

                {/* Deep Dive Sections */}
                <div className="space-y-32">
                  {/* Innovation 1: Telic Evolution */}
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 text-cyan-400">
                        <Zap className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em]">Innovation 01</span>
                      </div>
                      <h3 className="text-4xl font-bold uppercase tracking-tight leading-tight">Telic Evolution & The Unified Equation</h3>
                      <p className="text-sm text-white/50 leading-relaxed">
                        The system implements a goal-directed evolutionary approach using a telic score.
                      </p>
                      <div className="bg-white/5 p-10 rounded-[2rem] border border-white/10 space-y-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="font-mono text-2xl text-center text-cyan-400 glow-text-cyan relative z-10">
                          B(S) = αI + γΦ + δE - βK + λ(I · Φ)
                        </div>
                        <p className="text-[10px] text-white/20 text-center uppercase tracking-[0.3em] relative z-10">The Unified Equation v1.1</p>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/20">Components</h4>
                        <ul className="grid grid-cols-2 gap-6 text-[11px] text-white/40">
                          <li className="flex gap-3 items-center"><span className="w-6 h-6 bg-white/5 rounded flex items-center justify-center text-cyan-400 font-bold">I</span> Information Entropy</li>
                          <li className="flex gap-3 items-center"><span className="w-6 h-6 bg-white/5 rounded flex items-center justify-center text-cyan-400 font-bold">Φ</span> Structural Coherence</li>
                          <li className="flex gap-3 items-center"><span className="w-6 h-6 bg-white/5 rounded flex items-center justify-center text-cyan-400 font-bold">E</span> Symbol Energy</li>
                          <li className="flex gap-3 items-center"><span className="w-6 h-6 bg-white/5 rounded flex items-center justify-center text-cyan-400 font-bold">K</span> Complexity Cost</li>
                        </ul>
                        <p className="text-xs italic text-white/30 mt-6 leading-relaxed border-l-2 border-cyan-500/30 pl-4">
                          The coupling term λ(I · Φ) allows information and structure to interact multiplicatively.
                        </p>
                      </div>
                    </div>
                    <div className="feature-card-white p-10 space-y-8">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-ocean-900/40">Parameter Note</h4>
                      <div className="space-y-6">
                        <div className="text-6xl font-bold tracking-tighter text-cyan-600">λ ≈ 0.618</div>
                        <p className="text-sm text-ocean-900/70 leading-relaxed">
                          The coupling factor λ defaults to 0.618, a value that emerged through extensive experimentation with system behavior.
                        </p>
                        <div className="pt-8 border-t border-ocean-900/10">
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ocean-900/50">
                            <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                            Emergent Stability Observed
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Innovation 2: Semantic Attractors */}
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 glass-panel p-10 space-y-8 border-white/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Observed Behavior</h4>
                      <div className="space-y-6">
                        <div className="text-6xl font-bold tracking-tighter text-white">6 Iterations</div>
                        <p className="text-sm text-white/50 leading-relaxed">
                          In testing, narratives often converge toward simplified symbolic forms within a small number of steps.
                        </p>
                        <div className="pt-8 border-t border-white/10">
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/60">
                            <Target className="w-5 h-5" />
                            Convergence Patterns Identified
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="order-1 lg:order-2 space-y-8">
                      <div className="flex items-center gap-3 text-cyan-400">
                        <Target className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em]">Innovation 02</span>
                      </div>
                      <h3 className="text-4xl font-bold uppercase tracking-tight leading-tight">Semantic Attractors</h3>
                      <p className="text-sm text-white/50 leading-relaxed">
                        The simulation treats narrative evolution as a dynamical system. Sequences tend to move toward stable configurations over time.
                      </p>
                      <div className="bg-white/5 p-10 rounded-[2rem] border border-white/10 space-y-6">
                        <div className="font-mono text-2xl text-center text-cyan-400 glow-text-cyan">
                          lim fᵏ(Nᵢ) = stable state
                        </div>
                        <p className="text-[10px] text-white/20 text-center uppercase tracking-[0.3em]">Convergence Theorem</p>
                      </div>
                      <p className="text-xs text-white/30 leading-relaxed italic border-l-2 border-cyan-500/30 pl-4">
                        This behavior can be used to explore where different narratives might share common structural elements.
                      </p>
                    </div>
                  </section>

                  {/* Innovation 3: Observer Phase Transition */}
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 text-cyan-400">
                        <Activity className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em]">Innovation 03</span>
                      </div>
                      <h3 className="text-4xl font-bold uppercase tracking-tight leading-tight">Observer Phase Transition</h3>
                      <p className="text-sm text-white/50 leading-relaxed">
                        When a sequence's average symbol weight (duality) crosses a threshold, the system flags an "observer" event.
                      </p>
                      <div className="bg-white/5 p-10 rounded-[2rem] border border-white/10 space-y-6">
                        <div className="font-mono text-2xl text-center text-cyan-400 glow-text-cyan">
                          Ψ(S) = [D ≥ 0.8] → Observer
                        </div>
                        <p className="text-[10px] text-white/20 text-center uppercase tracking-[0.3em]">Phase Transition Logic</p>
                      </div>
                      <p className="text-xs text-white/30 leading-relaxed italic border-l-2 border-cyan-500/30 pl-4">
                        This is a useful marker for tracking when a sequence becomes sufficiently structured.
                      </p>
                    </div>
                    <div className="feature-card-white p-10 space-y-8">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-ocean-900/40">Fidelity Observation</h4>
                      <div className="space-y-6">
                        <div className="text-6xl font-bold tracking-tighter text-cyan-600">85-97% Fidelity</div>
                        <p className="text-sm text-ocean-900/70 leading-relaxed">
                          The reverse evolution method can reconstruct earlier states with generally high accuracy under test conditions.
                        </p>
                        <div className="pt-8 border-t border-ocean-900/10">
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ocean-900/50">
                            <Workflow className="w-5 h-5 text-cyan-500" />
                            Causal Chain Recovery Observed
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Algebraic Summary Table */}
                <section className="space-y-12 pt-20 border-t border-white/5">
                  <div className="text-center space-y-4">
                    <h3 className="text-3xl font-bold uppercase tracking-[0.2em] glow-text-cyan">The Algebraic Core</h3>
                    <p className="text-sm text-white/30 tracking-widest uppercase">A summary of the mathematical bridges built during V9 research.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                      { 
                        title: "Telic Curvature Bridge", 
                        formula: "κ_telic = κ_Ollivier (1 + λΔT)", 
                        desc: "A formulation linking system geometry with telic gradients." 
                      },
                      { 
                        title: "Reverse Evolution Path Integral", 
                        formula: "P(S₀|Sₜ) ∝ Σ exp(Σ T(Sᵢ))", 
                        desc: "A method for inferring past states from current observations." 
                      },
                      { 
                        title: "Duality Update Equation", 
                        formula: "Dₜ₊₁ = Dₜ + λCₜ + ηNₜ + ε", 
                        desc: "Describes how duality evolves step by step." 
                      }
                    ].map(item => (
                      <div key={item.title} className="glass-panel p-8 space-y-6 border-white/5 hover:border-cyan-500/30 transition-all group">
                        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 group-hover:text-cyan-400 transition-colors">{item.title}</h5>
                        <div className="bg-white/5 p-6 rounded-2xl font-mono text-xs text-center text-white/80 border border-white/5">
                          {item.formula}
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* The Open Seam Section */}
                <section className="glass-panel p-12 bg-ocean-950 border-cyan-500/20 space-y-8 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Brain className="w-64 h-64 text-cyan-400" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl font-bold uppercase tracking-[0.3em] flex items-center gap-4 text-cyan-400">
                      <Lightbulb className="w-8 h-8 animate-pulse" />
                      The Open Seam: Consciousness Integral
                    </h3>
                    <div className="bg-white/5 p-10 rounded-[2rem] font-mono text-4xl text-center text-white border border-white/5 glow-text-cyan">
                      C = ∫ (Q × L × Cₘ) dt
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed max-w-3xl">
                      A conceptual placeholder — variables are intentionally undefined, marking an area for future exploration.
                    </p>
                    <div className="pt-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                      <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                      Philosophically Novel: Framing limits as opportunities.
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="space-y-16 max-w-5xl mx-auto pb-32">
                <header className="text-center space-y-6">
                  <h2 className="text-5xl font-bold tracking-tighter uppercase glow-text-cyan">Global Meaning Infrastructure</h2>
                  <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
                    A platform that helps humanity navigate complexity, resolve conflict, and amplify collective wisdom.
                  </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <VisionCard 
                    index="01"
                    title="Universal Symbolic Translator"
                    subtitle="Codex"
                    impact="Cross-cultural communication, universal concept maps for education, and instant crisis response."
                    icon={<Database className="w-5 h-5" />}
                  />
                  <VisionCard 
                    index="02"
                    title="Finding Common Ground"
                    subtitle="Semantic Attractors"
                    impact="Conflict resolution by identifying shared core values (🕯️) and designing resonant policies."
                    icon={<Target className="w-5 h-5" />}
                  />
                  <VisionCard 
                    index="03"
                    title="Collective Good Optimization"
                    subtitle="Telos Engine"
                    impact="Optimizing resource allocation, democratic deliberation, and AI alignment for harmony."
                    icon={<Zap className="w-5 h-5" />}
                  />
                  <VisionCard 
                    index="04"
                    title="Measuring Societal Health"
                    subtitle="Emergence Bridge"
                    impact="Societal emergence index, early warning systems for unrest, and transparent accountability."
                    icon={<BarChart3 className="w-5 h-5" />}
                  />
                  <VisionCard 
                    index="05"
                    title="Learning from History"
                    subtitle="Reverse Evolution"
                    impact="Reconstructing causal chains of crises and modeling restorative justice paths."
                    icon={<RefreshCw className="w-4 h-4" />}
                  />
                  <VisionCard 
                    index="06"
                    title="Designing for Harmony"
                    subtitle="Golden Ratio Bias"
                    impact="Urban planning, product design, and organizational structures following nature's stable patterns."
                    icon={<Shield className="w-5 h-5" />}
                  />
                </div>

                <section className="glass-panel p-12 bg-ocean-950 border-cyan-500/20 relative overflow-hidden group">
                  <div className="relative z-10 space-y-8">
                    <h3 className="text-3xl font-bold uppercase tracking-[0.3em] flex items-center gap-4 text-cyan-400">
                      <CompassIcon className="w-10 h-10 animate-spin-slow" />
                      The Compass Platform
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed max-w-3xl">
                      We are building a public-benefit infrastructure accessible via web, mobile, and low-bandwidth channels. 
                      "The Compass" offers a universal symbol library, a deliberation engine for collective paths, 
                      and a health dashboard for nations.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:bg-white/10 transition-colors">Open Data</div>
                      <div className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:bg-white/10 transition-colors">Privacy Preserving</div>
                      <div className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:bg-white/10 transition-colors">Distributed Trust</div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full -mr-48 -mt-48 group-hover:bg-cyan-500/10 transition-all duration-1000" />
                </section>

                <footer className="text-center space-y-6 pt-16">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/20 italic leading-relaxed max-w-2xl mx-auto">
                    "The candle 🕯️ reminds us that at our core, we all seek awareness, guidance, and continuity."
                  </p>
                </footer>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="border-t border-white/10 p-3 bg-ocean-950/60 backdrop-blur-md flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            <span>Status: Operational</span>
          </div>
          <span>Engine: Telos v0.9</span>
          <span>Ontology: Codex V9</span>
          <span className="hidden sm:inline">Seed: ga20ha</span>
        </div>
        <div className="font-bold">
          © 2026 Blue Whale Research Team
        </div>
      </footer>
    </div>
  );
}

function MetricCard({ title, value, unit, icon, desc, status }: { 
  title: string, 
  value: string | number, 
  unit: string, 
  icon: React.ReactNode, 
  desc: string,
  status?: 'success' | 'error'
}) {
  return (
    <div className="glass-panel p-6 space-y-5 border-white/5 group hover:border-cyan-500/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">{title}</span>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-4xl font-bold tracking-tighter glow-text-cyan",
            status === 'success' && "text-cyan-400",
            status === 'error' && "text-rose-400"
          )}>{value}</span>
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{unit}</span>
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed mt-3 font-medium">{desc}</p>
      </div>
    </div>
  );
}

function VisionCard({ index, title, subtitle, impact, icon }: {
  index: string,
  title: string,
  subtitle: string,
  impact: string,
  icon: React.ReactNode
}) {
  return (
    <div className="glass-panel p-8 space-y-8 group hover:bg-white hover:text-ocean-950 transition-all duration-700 border-white/5">
      <div className="flex items-center justify-between">
        <span className="text-5xl font-bold opacity-5 group-hover:opacity-10 font-mono tracking-tighter">{index}</span>
        <div className="p-3 bg-white/5 group-hover:bg-ocean-950/5 rounded-2xl text-cyan-400 transition-colors">
          {icon}
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400 group-hover:text-ocean-950/40">{subtitle}</h4>
        <h3 className="text-2xl font-bold leading-tight tracking-tight uppercase">{title}</h3>
      </div>
      <p className="text-xs leading-relaxed text-white/40 group-hover:text-ocean-950/70 font-medium">
        {impact}
      </p>
    </div>
  );
}

