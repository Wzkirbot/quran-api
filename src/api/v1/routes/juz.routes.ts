import { Router, Request, Response, NextFunction } from 'express';
import { quranService } from '../../../services/quran.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';
import { parseIntegerParam } from '../../../utils/validation.js';

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
    const id = parseIntegerParam(req.params.id, { min: 1, max: 30 });
    if (id === null) {
      sendError(req, res, 'INVALID_PARAMETER', 'Juz ID must be an integer between 1 and 30.', 400);
      return;
    }

    const page = parseIntegerParam(req.query.page as string, { min: 1, defaultValue: 1 }) ?? 1;
    const limit = parseIntegerParam(req.query.limit as string, { min: 1, defaultValue: 50 }) ?? 50;

    const result = await quranService.getJuzAyahs(id, page, limit);
    sendSuccess(req, res, result.ayahs, {
      juz: result.juz,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit)
    });
  } catch (err) {
    next(err);
  }
});
