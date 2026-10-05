import { Router, Request, Response, NextFunction } from 'express';
import { quranService } from '../../../services/quran.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';

export const surahsRouter = Router();

// GET /v1/surahs - List all 114 Surahs
surahsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const surahs = await quranService.getSurahs();
    sendSuccess(req, res, surahs, { total: surahs.length });
  } catch (err) {
    next(err);
  }
});

// GET /v1/surahs/:id - Get single Surah by ID (1-114)
surahsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1 || id > 114) {
      sendError(req, res, 'INVALID_PARAMETER', 'Surah ID must be an integer between 1 and 114.', 400);
      return;
    }

    const surah = await quranService.getSurahById(id);
    if (!surah) {
      sendError(req, res, 'SURAH_NOT_FOUND', `Surah with ID ${id} not found.`, 404);
      return;
    }

    sendSuccess(req, res, surah);
  } catch (err) {
    next(err);
  }
});

// GET /v1/surahs/:id/ayahs - Get Ayahs of a specific Surah with pagination
surahsRouter.get('/:id/ayahs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1 || id > 114) {
      sendError(req, res, 'INVALID_PARAMETER', 'Surah ID must be an integer between 1 and 114.', 400);
      return;
    }

    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);

    const result = await quranService.getSurahAyahs(id, page, limit);
    sendSuccess(req, res, result.ayahs, {
      surah: result.surah,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit)
    });
  } catch (err: any) {
    next(err);
  }
});
