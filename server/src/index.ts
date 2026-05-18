import express, { type NextFunction, type Request, type Response } from 'express';
import {
  detectSourcePlatform,
  extractCaptionFromSharedText,
  fetchCaptionFromUrl,
  normalizeSocialUrl,
} from './caption.js';
import { analyzeRestaurantWithOpenRouter } from './openrouter.js';
import { sanitizeImportAnalysis } from './restaurantSchema.js';
import type { ImportAnalyzeRequest } from './types.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json({ limit: '256kb' }));
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }
  next();
});

app.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'pocket-palette-ai' });
});

app.post('/import/analyze', async (request: Request<object, object, ImportAnalyzeRequest>, response, next) => {
  try {
    const normalizedUrl = normalizeSocialUrl(request.body.url ?? '');
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      response.status(400).json({ error: 'INVALID_URL', message: 'A valid url is required.' });
      return;
    }

    const sourcePlatform = request.body.platform ?? detectSourcePlatform(normalizedUrl);
    const warnings: string[] = [];
    let sourceCaption = (request.body.caption ?? '').trim() || extractCaptionFromSharedText(request.body.url ?? '');

    if (!sourceCaption) {
      try {
        sourceCaption = (await fetchCaptionFromUrl(normalizedUrl, sourcePlatform)).trim();
      } catch {
        warnings.push('無法讀取連結中的公開 metadata，請貼上貼文文案。');
      }
    }

    if (!sourceCaption) {
      response.json({
        sourceUrl: normalizedUrl,
        sourcePlatform,
        sourceCaption: '',
        status: '尚未去過',
        isImportedFromSocial: true,
        normalizedUrl,
        aiSummary: '',
        aiConfidence: 0.18,
        missingFields: ['店家名稱', '城市', '區域', '至少一個標籤分類'],
        warnings,
      });
      return;
    }

    const raw = await analyzeRestaurantWithOpenRouter({
      caption: sourceCaption,
      url: normalizedUrl,
      platform: sourcePlatform,
    });

    response.json(
      sanitizeImportAnalysis({
        raw,
        normalizedUrl,
        sourcePlatform,
        sourceCaption,
        warnings,
      }),
    );
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unknown server error';
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({
      error: 'INVALID_JSON',
      message: 'Request body must be valid JSON.',
    });
    return;
  }

  const isKeyError = message.includes('API key');
  response.status(isKeyError ? 500 : 502).json({
    error: isKeyError ? 'OPENROUTER_NOT_CONFIGURED' : 'IMPORT_ANALYSIS_FAILED',
    message: isKeyError ? 'OpenRouter API key is not configured on the server.' : 'AI import analysis is temporarily unavailable.',
  });
});

app.listen(port, () => {
  console.log(`Pocket Palette AI server listening on ${port}`);
});
