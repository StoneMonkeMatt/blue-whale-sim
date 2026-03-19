import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Proxy route for AI providers (except Gemini which is client-side)
  app.post("/api/proxy/ai", async (req, res) => {
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
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
