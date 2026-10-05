import { Router, Request, Response, NextFunction } from 'express';
import { quranService } from '../../../services/quran.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';

export const searchRouter = Router();

// GET /v1/search?q=...&surah=...&juz=...&page=1&limit=20
searchRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length < 2) {
      sendError(req, res, 'INVALID_QUERY', 'Search query "q" parameter must be at least 2 characters long.', 400);
      return;
    }

    const surahId = req.query.surah ? parseInt(req.query.surah as string, 10) : undefined;
    const juzId = req.query.juz ? parseInt(req.query.juz as string, 10) : undefined;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

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
  } catch (err: any) {
    next(err);
  }
});
