import { Router, Request, Response, NextFunction } from 'express';
import { quranService } from '../../../services/quran.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';
import { parseIntegerParam } from '../../../utils/validation.js';

export const searchRouter = Router();

// GET /v1/search?q=...&surah=...&juz=...&page=1&limit=20
searchRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    if (!q || q.trim().length < 2) {
      sendError(req, res, 'INVALID_QUERY', 'Search query "q" parameter must be at least 2 characters long.', 400);
      return;
    }

    const surahId = parseIntegerParam(req.query.surah as string, { min: 1, max: 114 }) ?? undefined;
    const juzId = parseIntegerParam(req.query.juz as string, { min: 1, max: 30 }) ?? undefined;
    const page = parseIntegerParam(req.query.page as string, { min: 1, defaultValue: 1 }) ?? 1;
    const limit = parseIntegerParam(req.query.limit as string, { min: 1, max: 100, defaultValue: 20 }) ?? 20;

    const result = await quranService.search(q, {
      surahId,
      juzId,
      page,
      limit
    });

    sendSuccess(req, res, result.ayahs, {
      query: result.query,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit)
    });
  } catch (err) {
    next(err);
  }
});
