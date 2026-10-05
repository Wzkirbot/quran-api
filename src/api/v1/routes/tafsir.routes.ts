import { Router, Request, Response, NextFunction } from 'express';
import { tafsirService } from '../../../services/tafsir.service.js';
import { translationService } from '../../../services/translation.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';

export const tafsirRouter = Router();

// GET /v1/tafsir/:surah/:ayah - Get Tafsir of an Ayah
tafsirRouter.get('/tafsir/:surah/:ayah', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const surahId = parseInt(req.params.surah, 10);
    const ayahNumber = parseInt(req.params.ayah, 10);
    const tafsirName = (req.query.name as string) || 'muyassar';

    if (isNaN(surahId) || isNaN(ayahNumber)) {
      sendError(req, res, 'INVALID_PARAMETER', 'Surah ID and Ayah number must be integers.', 400);
      return;
    }

    const result = await tafsirService.getTafsir(surahId, ayahNumber, tafsirName);
    if (!result) {
      sendError(req, res, 'TAFSIR_NOT_FOUND', `Tafsir not found for ${surahId}:${ayahNumber}.`, 404);
      return;
    }

    sendSuccess(req, res, result);
  } catch (err) {
    next(err);
  }
});

// GET /v1/translations/:surah/:ayah - Get Translation of an Ayah
tafsirRouter.get('/translations/:surah/:ayah', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const surahId = parseInt(req.params.surah, 10);
    const ayahNumber = parseInt(req.params.ayah, 10);
    const lang = (req.query.lang as string) || 'en';

    if (isNaN(surahId) || isNaN(ayahNumber)) {
      sendError(req, res, 'INVALID_PARAMETER', 'Surah ID and Ayah number must be integers.', 400);
      return;
    }

    const result = await translationService.getTranslation(surahId, ayahNumber, lang);
    if (!result) {
      sendError(req, res, 'TRANSLATION_NOT_FOUND', `Translation not found for ${surahId}:${ayahNumber} in language "${lang}".`, 404);
      return;
    }

    sendSuccess(req, res, result);
  } catch (err) {
    next(err);
  }
});
