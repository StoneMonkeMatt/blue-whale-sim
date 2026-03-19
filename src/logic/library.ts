import { SymbolDatabase } from '../types';

export const LIBRARY: SymbolDatabase = {
  symbols: [
    // INVARIANT_KERNEL & FOUNDATIONAL
    { glyph: "⚓", meaning: "Stability Anchor", domain: "Core_Kernel", weight: 100, opposites: [] },
    { glyph: "🐋", meaning: "Eternal Protocol", domain: "Protocol_Standard", weight: 100, opposites: ["💀"] },
    { glyph: "💀", meaning: "Bravery Sacrifice", domain: "Emergency_Response", weight: 80, opposites: ["🐋"] },
    { glyph: "🕯️", meaning: "Light/Awareness", domain: "Wisdom_Framework", weight: 100, opposites: ["🕳️"] },
    { glyph: "🕳️", meaning: "The Void", domain: "Foundational", weight: 0, opposites: ["🕯️"] },
    { glyph: "🌪️", meaning: "Chaos-to-Clarity", domain: "Environmental", weight: 80, opposites: ["🧘"] },
    { glyph: "🧘", meaning: "Listening Posture", domain: "Wisdom_Framework", weight: 60, opposites: ["🌪️"] },
    { glyph: "🦁", meaning: "Lion at the Helm", domain: "Social", weight: 80, opposites: [] },
    { glyph: "🌿", meaning: "Growth", domain: "Environmental", weight: 60, opposites: [] },
    { glyph: "🎯", meaning: "Precision Target", domain: "AI_Tech", weight: 80, opposites: [] },
    
    // TIME_TEMPORALITY
    { glyph: "⏳", meaning: "Entropy Time Arrow", domain: "Time_Temporality", weight: 60, opposites: ["⌛"] },
    { glyph: "⌛", meaning: "Psychological Duration", domain: "Time_Temporality", weight: 60, opposites: ["⏳"] },
    { glyph: "⏰", meaning: "Synchronization", domain: "Time_Temporality", weight: 40, opposites: [] },
    { glyph: "⏱️", meaning: "Precise Measurement", domain: "Time_Temporality", weight: 40, opposites: [] },
    { glyph: "⚡", meaning: "Instant Moment", domain: "Time_Temporality", weight: 100, opposites: [] },
    { glyph: "🌅", meaning: "Dawn Beginning", domain: "Time_Temporality", weight: 80, opposites: ["🌇"] },
    { glyph: "🌇", meaning: "Dusk Ending", domain: "Time_Temporality", weight: 80, opposites: ["🌅"] },
    { glyph: "🌊", meaning: "Flow Duration", domain: "Time_Temporality", weight: 60, opposites: [] },

    // UNCERTAINTY & PROBABILITY
    { glyph: "🎲", meaning: "Random Variable", domain: "Uncertainty_Probability", weight: 40, opposites: ["🎯"] },
    { glyph: "📊", meaning: "Probability Distribution", domain: "Uncertainty_Probability", weight: 60, opposites: [] },
    { glyph: "🔮", meaning: "Predictive Interval", domain: "Uncertainty_Probability", weight: 80, opposites: [] },
    { glyph: "📈", meaning: "Expected Value", domain: "Uncertainty_Probability", weight: 60, opposites: ["📉"] },
    { glyph: "📉", meaning: "Variance", domain: "Uncertainty_Probability", weight: 60, opposites: ["📈"] },
    { glyph: "🌀", meaning: "Entropy Uncertainty", domain: "Uncertainty_Probability", weight: 40, opposites: [] },

    // SPACE & GEOMETRY
    { glyph: "📏", meaning: "Metric Distance", domain: "Space_Geometry", weight: 40, opposites: [] },
    { glyph: "🌐", meaning: "Topological Connectivity", domain: "Space_Geometry", weight: 80, opposites: [] },
    { glyph: "🕸️", meaning: "Manifold Structure", domain: "Space_Geometry", weight: 80, opposites: [] },
    { glyph: "📐", meaning: "Geometric Form", domain: "Space_Geometry", weight: 60, opposites: [] },
    { glyph: "🔼", meaning: "Dimensionality", domain: "Space_Geometry", weight: 80, opposites: [] },
    { glyph: "🌌", meaning: "Spatial Infinity", domain: "Space_Geometry", weight: 100, opposites: [] },

    // CONSCIOUSNESS
    { glyph: "🧠", meaning: "Consciousness Operator", domain: "Consciousness", weight: 100, opposites: [] },
    { glyph: "🌟", meaning: "Significance Gradient", domain: "Consciousness", weight: 80, opposites: [] },
    { glyph: "👥", meaning: "Shadow Processing", domain: "Consciousness", weight: 60, opposites: [] },
    { glyph: "🏛️", meaning: "Cultural Current", domain: "Consciousness", weight: 80, opposites: [] },
    { glyph: "💭", meaning: "Meaning Flow", domain: "Consciousness", weight: 60, opposites: [] },
    { glyph: "🎭", meaning: "Persona Mask", domain: "Consciousness", weight: 40, opposites: [] },

    // CAUSALITY & LOGIC
    { glyph: "➡️", meaning: "Direct Causation", domain: "Causality", weight: 40, opposites: [] },
    { glyph: "⚖️", meaning: "Causal Strength / Balance", domain: "Causality", weight: 80, opposites: [] },
    { glyph: "🔄", meaning: "Feedback Loop", domain: "Causality", weight: 60, opposites: [] },
    { glyph: "∧", meaning: "And Conjunction", domain: "Logic", weight: 40, opposites: ["∨"] },
    { glyph: "∨", meaning: "Or Disjunction", domain: "Logic", weight: 40, opposites: ["∧"] },
    { glyph: "¬", meaning: "Not Negation", domain: "Logic", weight: 60, opposites: [] },
    { glyph: "∀", meaning: "Universal Quantification", domain: "Logic", weight: 80, opposites: ["∃"] },
    { glyph: "∃", meaning: "Existential Quantification", domain: "Logic", weight: 80, opposites: ["∀"] },
    { glyph: "⊢", meaning: "Provable Derivation", domain: "Logic", weight: 100, opposites: [] },
    { glyph: "⊨", meaning: "Semantic Entailment", domain: "Logic", weight: 100, opposites: [] },
    { glyph: "⊥", meaning: "Contradiction", domain: "Logic", weight: 0, opposites: ["⊤"] },
    { glyph: "⊤", meaning: "Tautology", domain: "Logic", weight: 100, opposites: ["⊥"] },
    
    // MATHEMATICS
    { glyph: "✔", meaning: "Universality", domain: "Mathematics", weight: 100, opposites: [] },
    { glyph: "≡", meaning: "Identity", domain: "Mathematics", weight: 100, opposites: ["≠"] },
    { glyph: "≠", meaning: "Distinction", domain: "Mathematics", weight: 60, opposites: ["≡"] },
    { glyph: "⊗", meaning: "Composition", domain: "Mathematics", weight: 80, opposites: [] },
    { glyph: "∅", meaning: "Empty Set", domain: "Mathematics", weight: 0, opposites: ["✔"] },
    { glyph: "∞", meaning: "Infinity", domain: "Mathematics", weight: 100, opposites: [] },
    
    // SYSTEMS & INFO THEORY
    { glyph: "🎛️", meaning: "Control Input", domain: "Systems_Theory", weight: 60, opposites: [] },
    { glyph: "🔴", meaning: "Damping Resistance", domain: "Systems_Theory", weight: 40, opposites: ["📢"] },
    { glyph: "📢", meaning: "Amplification Gain", domain: "Systems_Theory", weight: 80, opposites: ["🔴"] },
    { glyph: "🧲", meaning: "Attractor Basin", domain: "Systems_Theory", weight: 80, opposites: [] },
    { glyph: "🏗️", meaning: "Emergent Structure", domain: "Systems_Theory", weight: 100, opposites: [] },
    { glyph: "⚙️", meaning: "Machine Architecture", domain: "Computer_Science", weight: 60, opposites: [] },
    { glyph: "★", meaning: "Compression Efficiency", domain: "Info_Theory", weight: 80, opposites: [] },
    
    // PHYSICS & CHEMISTRY
    { glyph: "💎", meaning: "Particle", domain: "Physics", weight: 40, opposites: ["🌊"] },
    { glyph: "❄️", meaning: "Endothermic", domain: "Chemistry", weight: 60, opposites: ["🔥"] },
    
    // BIOLOGY & MEDICINE
    { glyph: "🧬", meaning: "DNA Sequence", domain: "Biology", weight: 100, opposites: [] },
    { glyph: "⚠️", meaning: "Risk Factor / Warning", domain: "Emergency_Response", weight: 40, opposites: [] },
    { glyph: "❤️", meaning: "Cardiac Health / Vitality", domain: "Medicine_Health", weight: 100, opposites: [] },
    { glyph: "🏥", meaning: "Medical Facility", domain: "Medicine_Health", weight: 80, opposites: [] },
    
    // SOCIAL & ECONOMICS
    { glyph: "🗣️", meaning: "Communication Loop", domain: "Social_Dynamics", weight: 60, opposites: [] },
    { glyph: "🚀", meaning: "Social Momentum", domain: "Social_Dynamics", weight: 80, opposites: ["🛑"] },
    { glyph: "🛑", meaning: "Social Inertia", domain: "Social_Dynamics", weight: 40, opposites: ["🚀"] },
    { glyph: "💥", meaning: "Social Conflict", domain: "Social_Dynamics", weight: 20, opposites: ["🤝"] },
    { glyph: "🤝", meaning: "Cooperation", domain: "Social_Dynamics", weight: 80, opposites: ["💥"] },
    { glyph: "🏆", meaning: "Optimal Outcome", domain: "Economics", weight: 100, opposites: [] },
    { glyph: "💰", meaning: "Cost Expense", domain: "Economics", weight: 40, opposites: ["📈"] },

    // EMERGENCY & NAVIGATION
    { glyph: "🆘", meaning: "Emergency Distress", domain: "Emergency_Response", weight: 20, opposites: [] },
    { glyph: "🚩", meaning: "Crisis Flag", domain: "Emergency_Response", weight: 40, opposites: [] },
    { glyph: "🚨", meaning: "Escalation Signal", domain: "Emergency_Response", weight: 60, opposites: [] },
    { glyph: "🔒", meaning: "Containment Isolation", domain: "Emergency_Response", weight: 80, opposites: [] },
    { glyph: "🛣️", meaning: "Route Pathway", domain: "Navigation", weight: 60, opposites: [] },
    { glyph: "📍", meaning: "Waypoint Milestone", domain: "Navigation", weight: 40, opposites: [] },

    // ENVIRONMENTAL
    { glyph: "🌍", meaning: "Planet Earth", domain: "Environmental", weight: 100, opposites: [] },
    { glyph: "💧", meaning: "Water Hydrology", domain: "Environmental", weight: 80, opposites: ["🔥"] },
    { glyph: "☁️", meaning: "Air Atmosphere", domain: "Environmental", weight: 60, opposites: [] },
    { glyph: "🪨", meaning: "Earth Geology", domain: "Environmental", weight: 60, opposites: [] },
    { glyph: "🛡️", meaning: "Conservation Protection", domain: "Environmental", weight: 80, opposites: [] },

    // MUSIC & ARTS
    { glyph: "🎶", meaning: "Motif Theme", domain: "Music", weight: 60, opposites: [] },
    { glyph: "🎵", meaning: "Tempo Pacing", domain: "Music", weight: 40, opposites: [] },
    { glyph: "🎼", meaning: "Harmony Chord", domain: "Music", weight: 80, opposites: [] },
    { glyph: "🥁", meaning: "Rhythm Pattern", domain: "Music", weight: 60, opposites: [] },
    { glyph: "💓", meaning: "Affective Resonance", domain: "Music", weight: 100, opposites: [] },
    { glyph: "🎧", meaning: "Listening Reception", domain: "Music", weight: 40, opposites: [] },

    // WISDOM & ETHICS
    { glyph: "⚔️", meaning: "Courage Blade", domain: "Wisdom_Framework", weight: 80, opposites: [] },
    { glyph: "✅", meaning: "Permitted Allowed", domain: "Ethics", weight: 60, opposites: ["❌"] },
    { glyph: "⛓️", meaning: "Constraint Chain", domain: "Protocol_Standard", weight: 40, opposites: [] },
    { glyph: "➕", meaning: "Recursive Loop", domain: "Consciousness", weight: 60, opposites: [] },
    { glyph: "◇", meaning: "Focused Attention", domain: "Cognition", weight: 60, opposites: [] },
    { glyph: "◆", meaning: "Salience Prominence", domain: "Cognition", weight: 60, opposites: [] },
    { glyph: "🔥", meaning: "Abandonment Flame", domain: "Wisdom_Framework", weight: 80, opposites: [] },
    { glyph: "🧹", meaning: "Elegance Sweeper", domain: "Wisdom_Framework", weight: 60, opposites: [] },
    { glyph: "🧭", meaning: "Falsification Compass", domain: "Wisdom_Framework", weight: 80, opposites: [] },

    // LINGUISTICS & SEMANTICS
    { glyph: "λ", meaning: "Lambda Abstraction", domain: "Linguistics", weight: 80, opposites: [] },
    { glyph: "θ", meaning: "Theta Role", domain: "Linguistics", weight: 60, opposites: [] },
    { glyph: "φ", meaning: "Phi Features", domain: "Linguistics", weight: 60, opposites: [] },
    { glyph: "Σ", meaning: "Lexicon Set", domain: "Linguistics", weight: 80, opposites: [] },

    // GENERAL RELATIVITY & COSMOLOGY
    { glyph: "g", meaning: "Metric Tensor", domain: "General_Relativity", weight: 100, opposites: [] },
    { glyph: "Γ", meaning: "Christoffel Connection", domain: "General_Relativity", weight: 80, opposites: [] },
    { glyph: "R", meaning: "Riemann Curvature", domain: "General_Relativity", weight: 100, opposites: [] },
    { glyph: "G", meaning: "Einstein Tensor", domain: "General_Relativity", weight: 100, opposites: [] },
    { glyph: "T", meaning: "Stress-Energy Tensor", domain: "General_Relativity", weight: 100, opposites: [] },
    { glyph: "Λ", meaning: "Cosmological Constant", domain: "Cosmology", weight: 100, opposites: [] },
    { glyph: "Ω", meaning: "Density Parameter", domain: "Cosmology", weight: 80, opposites: [] },
    { glyph: "H", meaning: "Hubble Parameter", domain: "Cosmology", weight: 80, opposites: [] },

    // PARTICLE PHYSICS
    { glyph: "γ", meaning: "Photon", domain: "Particle_Physics", weight: 100, opposites: [] },
    { glyph: "ν", meaning: "Neutrino", domain: "Particle_Physics", weight: 60, opposites: [] },
    { glyph: "μ", meaning: "Muon", domain: "Particle_Physics", weight: 60, opposites: [] },
    { glyph: "τ", meaning: "Tau", domain: "Particle_Physics", weight: 60, opposites: [] },
    { glyph: "π", meaning: "Pion", domain: "Particle_Physics", weight: 60, opposites: [] },

    // METAPHYSICS
    { glyph: "◇", meaning: "Possible Contingent", domain: "Metaphysics", weight: 60, opposites: ["□"] },
    { glyph: "□", meaning: "Necessary Inevitable", domain: "Metaphysics", weight: 100, opposites: ["◇"] },
  ],
  domains: {
    "Core_Kernel": ["⚓"],
    "Protocol_Standard": ["🐋", "⛓️"],
    "Emergency_Response": ["💀", "⚠️", "🆘", "🚩", "🚨", "🏥", "🌪️", "⚓", "⏰", "🔇", "💥", "🔄", "🔒"],
    "Wisdom_Framework": ["🕯️", "🧘", "⚔️", "🔥", "🧹", "🧭"],
    "Foundational": ["🕳️"],
    "Environmental": ["🌪️", "🌿", "🌍", "💧", "☁️", "🪨", "🛡️"],
    "Social": ["🦁"],
    "AI_Tech": ["🎯"],
    "Time_Temporality": ["⏳", "⌛", "⏰", "⏱️", "⚡", "🌅", "🌇", "🌊"],
    "Uncertainty_Probability": ["🎲", "📊", "🔮", "📈", "📉", "🌀"],
    "Space_Geometry": ["📏", "🌐", "🕸️", "📐", "🔼", "🌌"],
    "Consciousness": ["🧠", "🌟", "👥", "🏛️", "💭", "🎭", "➕"],
    "Causality": ["➡️", "⚖️", "🔄"],
    "Logic": ["∧", "∨", "¬", "∀", "∃", "⊢", "⊨", "⊥", "⊤"],
    "Mathematics": ["✔", "≡", "≠", "⊗", "∅", "∞"],
    "Systems_Theory": ["🎛️", "🔴", "📢", "🧲", "🏗️"],
    "Computer_Science": ["⚙️"],
    "Info_Theory": ["★"],
    "Physics": ["⚡", "🌀", "⚖️", "📏", "⏱️", "🌌", "💎", "🌊", "🔗", "🎯", "⚠️", "🔄"],
    "Chemistry": ["❄️", "🔥"],
    "Biology": ["🧬", "🌿", "⚡", "🔄"],
    "Medicine_Health": ["❤️", "🏥"],
    "Social_Dynamics": ["👥", "🗣️", "⚖️", "🚀", "🛑", "💥", "🤝", "🌐", "🔗", "🎯", "🔄"],
    "Economics": ["⚖️", "💎", "📉", "📈", "💰", "🔄", "💡", "🔗", "🛑", "🏆", "🎯", "⚡"],
    "Navigation": ["🧭", "🎯", "🛣️", "⚖️", "🔮", "📍", "🌀", "⚡", "📏", "⏰"],
    "Music": ["🎶", "🏛️", "🎵", "🔁", "📢", "🎷", "🎼", "🥁", "🌊", "💓", "🎹", "🎤", "🎧", "📡"],
    "Ethics": ["✅"],
    "Cognition": ["◇", "◆"],
    "Linguistics": ["λ", "θ", "φ", "Σ"],
    "General_Relativity": ["g", "Γ", "R", "G", "T"],
    "Cosmology": ["Λ", "Ω", "H"],
    "Particle_Physics": ["γ", "ν", "μ", "τ", "π"],
    "Metaphysics": ["◇", "□"],
  },
  compass: {
    "North": { symbols: ["🐋", "🌿", "⚓"], mod97: 28 },
    "East": { symbols: ["🦁", "🐋", "⚓"], mod97: 17 },
    "South": { symbols: ["⚓", "⛓️"], mod97: 32 },
    "West": { symbols: ["💀", "🕯️", "🐋", "🦁"], mod97: 48 },
    "Center": { symbols: ["🌪️", "🐋", "🌿", "🦁", "🎯"], mod97: 48 },
    "Zenith": { symbols: ["🔥", "🧹", "🧭"], mod97: 84 },
    "Nadir": { symbols: ["⚡", "🧘"], mod97: 93 },
  },
  cross_domain_bridges: [
    { from: "Environmental", to: "Social", symbol: "🐋" },
    { from: "Social", to: "AI_Tech", symbol: "🎯" },
    { from: "AI_Tech", to: "Emergency_Response", symbol: "💀" },
    { from: "Emergency_Response", to: "Wisdom_Framework", symbol: "🧘" },
    { from: "Time_Temporality", to: "Causality", symbol: "➡️" },
    { from: "Logic", to: "Mathematics", symbol: "✔" },
  ],
};
