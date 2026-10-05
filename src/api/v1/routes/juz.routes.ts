import { Router, Request, Response, NextFunction } from 'express';
import { quranService } from '../../../services/quran.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';

export const juzRouter = Router();

// GET /v1/juz - List all 30 Juz
juzRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await quranService.getJuzList();
    sendSuccess(req, res, list, { total: list.length });
  } catch (err) {
    next(err);
  }
});

// GET /v1/juz/:id - Get Ayahs of a specific Juz
juzRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1 || id > 30) {
      sendError(req, res, 'INVALID_PARAMETER', 'Juz ID must be an integer between 1 and 30.', 400);
      return;
    }

    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);

    const result = await quranService.getJuzAyahs(id, page, limit);
    sendSuccess(req, res, result.ayahs, {
      juz: result.juz,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit)
    });
  } catch (err: any) {
    next(err);
  }
});
