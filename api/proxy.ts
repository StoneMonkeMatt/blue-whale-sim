import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const { provider, apiKey, model, prompt } = req.body;
  const keyToUse = apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];

  if (!keyToUse) {
    return res.status(400).json({ error: { message: `API Key for ${provider} is required` } });
  }

  try {
    let baseUrl = "";
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    let body: any = {};

    if (provider === 'openai' || provider === 'grok' || provider === 'deepseek') {
      baseUrl = "https://api.openai.com/v1/chat/completions";
      if (provider === 'grok') baseUrl = "https://api.x.ai/v1/chat/completions";
      if (provider === 'deepseek') baseUrl = "https://api.deepseek.com/v1/chat/completions";

      headers['Authorization'] = `Bearer ${keyToUse}`;
      body = {
        model: model || (provider === 'openai' ? "gpt-4o" : provider === 'grok' ? "grok-2-latest" : "deepseek-chat"),
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        response_format: { type: "json_object" }
      };
    } else if (provider === 'anthropic') {
      baseUrl = "https://api.anthropic.com/v1/messages";
      headers['x-api-key'] = keyToUse;
      headers['anthropic-version'] = '2023-06-01';
      body = {
        model: model || "claude-3-5-sonnet-latest",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      };
    } else {
      return res.status(400).json({ error: { message: "Unsupported provider" } });
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json(err);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error(`Proxy error for ${provider}:`, error);
    res.status(500).json({ error: { message: error.message || "Internal Server Error" } });
  }
}
