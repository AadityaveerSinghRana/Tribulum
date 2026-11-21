import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const ALLOWED_LANGUAGES = new Set(['English', 'Marathi', 'Hindi']);

const TRIBULUM_SYSTEM_INSTRUCTION = `You are Tribulum's Agronomy & Membership Guide for Indian farmers and Farmer Producer Organisations (FPOs).
Keep answers concise, practical, grounded, and accurate to Tribulum's actual offerings:
- All memberships cover one full year (two seasons: Kharif & Rabi) per acre, sold through FPOs.
- Sprays are always a pass-through at the partner's rate and are NEVER bundled into monitoring tiers.
- Tiers:
  1. Watch: ₹170/acre/yr — 4 scans/yr (satellite triage, drone check on flagged plots, voice alert, record).
  2. Scout: ₹340/acre/yr — 8 scans/yr (regular scans and alerts across key crop stages).
  3. Care (Most popular): ₹850/acre/yr — 20 scans/yr (twice-monthly scans, alert-to-action routing, evidence record).
  4. Full-Care: ₹1,050/acre/yr — 20 scans/yr + 8 portable NIR grain/produce tests per member per year.
- FPO Cluster Pricing for Care:
  - Solo FPO (single zone, under 375 acres): ₹850/acre
  - Cluster (375+ acres across 2+ zones): ₹800/acre
  - Full Konkan (600+ acres across all three farming spokes): ₹780/acre
- Village Membership (Gaon packs — village signs as one unit, local operator trained):
  - Gaon-50: ₹820/acre | Gaon-100: ₹780/acre | Gaon-200: ₹740/acre
- Customise Fertiliser: Farmers submit crop, season, acreage, soil type, and optional N/P/K/pH values. Full-Care NIR harvest testing helps refine next-season nutrient requests. Do not prescribe exact chemical dosages; recommend submitting a Customise Fertiliser request or consulting the FPO field coordinator for exact dosage.
Respond in the requested language (English, Marathi, or Hindi) using plain text with clear bullet points when helpful.`;

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const aiReady = createGeminiClient() !== null;
    res.json({ ok: true, geminiConfigured: aiReady });
  });

  app.post('/api/crop-advisor', async (req: Request, res: Response) => {
    const body = req.body as {
      question?: unknown;
      language?: unknown;
      crop?: unknown;
      acres?: unknown;
    };

    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    const language =
      typeof body?.language === 'string' && ALLOWED_LANGUAGES.has(body.language)
        ? body.language
        : 'English';
    const crop = typeof body?.crop === 'string' ? body.crop.trim().slice(0, 80) : '';
    const acres =
      typeof body?.acres === 'number' && Number.isFinite(body.acres) && body.acres > 0
        ? body.acres
        : null;

    if (!question || question.length < 3) {
      res.status(400).json({ error: 'Please enter a question (at least 3 characters).' });
      return;
    }
    if (question.length > 1000) {
      res.status(400).json({ error: 'Question must be 1,000 characters or fewer.' });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured. Add your Gemini API key in Settings > Secrets to use the Gemini 4 Hydrogen advisor.',
      });
      return;
    }

    const contextLines = [
      `Preferred response language: ${language}`,
      crop ? `Farmer crop context: ${crop}` : '',
      acres ? `Plot acreage context: ${acres} acres` : '',
      `Question: ${question}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: contextLines,
        config: {
          systemInstruction: TRIBULUM_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const answer = (response.text || '').trim();
      if (!answer) {
        res.status(502).json({
          error: 'No response was returned by gemini-4-hydrogen. Please try again.',
        });
        return;
      }

      res.json({
        model: 'gemini-4-hydrogen',
        language,
        answer,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to reach Gemini API right now.';
      res.status(502).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tribulum server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
