import { Router, Request, Response, NextFunction } from 'express';
import { quranService } from '../../../services/quran.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';

export const pagesRouter = Router();

// GET /v1/pages/:number - Get Ayahs of a specific page (1-604)
pagesRouter.get('/:number', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageNumber = parseInt(req.params.number, 10);
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > 604) {
      sendError(req, res, 'INVALID_PARAMETER', 'Page number must be an integer between 1 and 604.', 400);
      return;
    }

    const result = await quranService.getPageAyahs(pageNumber);
    sendSuccess(req, res, result.ayahs, {
      page: result.page,
      total: result.total
    });
  } catch (err: any) {
    next(err);
  }
});
