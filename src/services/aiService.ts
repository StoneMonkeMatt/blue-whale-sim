import { GoogleGenAI, Type } from "@google/genai";
import { Symbol, AIConfig } from "../types";

export async function distillTextToSymbols(
  text: string, 
  availableSymbols: Symbol[], 
  config: AIConfig
): Promise<string[]> {
  if (!config.apiKey) {
    throw new Error("API Key is required for distillation.");
  }

  const validGlyphs = new Set(availableSymbols.map(s => s.glyph));
  const symbolMap = availableSymbols.map(s => `${s.glyph}: ${s.meaning}`).join(', ');
  
  const prompt = `You are a high-fidelity semantic distillation engine. 
Your goal is to extract the core symbolic essence from the provided text.

ONTOLOGY (Glyph: Meaning):
${symbolMap}

INSTRUCTIONS:
1. Read the input text carefully. If it is very long, focus on the overall narrative arc and recurring themes.
2. Identify the fundamental narrative arc, emotional core, and logical structure.
3. Map these elements to a sequence of EXACTLY 5 to 10 symbols from the ontology above.
4. Prioritize symbols that represent the "telos" or ultimate direction of the meaning.
5. Return ONLY a JSON array of strings containing the glyphs. Do not include any other text or explanation.

INPUT TEXT:
${text.substring(0, 100000)}`;

  if (config.provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const response = await ai.models.generateContent({
      model: config.model || "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        temperature: 0.2,
      }
    });

    try {
      const result = JSON.parse(response.text);
      return Array.isArray(result) ? result.filter(glyph => validGlyphs.has(glyph)) : [];
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      return [];
    }
  }

  // Generic OpenAI-compatible fetch for OpenAI, Grok, DeepSeek via local proxy
  if (config.provider === 'openai' || config.provider === 'grok' || config.provider === 'deepseek') {
    const response = await fetch("/api/proxy/ai", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: config.provider,
        apiKey: config.apiKey,
        model: config.model,
        prompt: prompt
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `${config.provider} request failed: ${response.statusText}`);
    }

    const data = await response.json();
    try {
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);
      const result = Array.isArray(parsed) ? parsed : (parsed.symbols || parsed.glyphs || Object.values(parsed)[0]);
      return Array.isArray(result) ? result.filter(glyph => validGlyphs.has(glyph)) : [];
    } catch (e) {
      console.error(`Failed to parse ${config.provider} response:`, e);
      return [];
    }
  }

  if (config.provider === 'anthropic') {
    const response = await fetch("/api/proxy/ai", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'anthropic',
        apiKey: config.apiKey,
        model: config.model,
        prompt: prompt
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Anthropic request failed");
    }

    const data = await response.json();
    try {
      const content = data.content[0].text;
      const match = content.match(/\[.*\]/s);
      const result = JSON.parse(match ? match[0] : content);
      return Array.isArray(result) ? result.filter(glyph => validGlyphs.has(glyph)) : [];
    } catch (e) {
      console.error("Failed to parse Anthropic response:", e);
      return [];
    }
  }

  return [];
}
