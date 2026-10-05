import { Router, Request, Response, NextFunction } from 'express';
import { quranService } from '../../../services/quran.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';
import { parseIntegerParam } from '../../../utils/validation.js';

export const pagesRouter = Router();

// GET /v1/pages/:number - Get Ayahs of a specific page (1-604)
pagesRouter.get('/:number', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageNumber = parseIntegerParam(req.params.number, { min: 1, max: 604 });
    if (pageNumber === null) {
      sendError(req, res, 'INVALID_PARAMETER', 'Page number must be an integer between 1 and 604.', 400);
      return;
    }

    const result = await quranService.getPageAyahs(pageNumber);
    sendSuccess(req, res, result.ayahs, {
      page: result.page,
      total: result.total
    });
  } catch (err) {
    next(err);
  }
});
