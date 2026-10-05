import { Router, Request, Response, NextFunction } from 'express';
import { tafsirService } from '../../../services/tafsir.service.js';
import { translationService } from '../../../services/translation.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';

export const tafsirRouter = Router();

// GET /v1/tafsir/:identifier/:surah/:ayah or /v1/tafsir/:surah/:ayah
tafsirRouter.get(['/tafsir/:param1/:param2/:param3', '/tafsir/:param1/:param2', '/tafsir/:param1'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { param1, param2, param3 } = req.params;
    let tafsirName = (req.query.name as string) || 'muyassar';
    let surahId: number;
    let ayahNumber: number | undefined;

    if (param3 !== undefined) {
      // /tafsir/:identifier/:surah/:ayah
      tafsirName = param1;
      surahId = parseInt(param2, 10);
      ayahNumber = parseInt(param3, 10);
    } else if (param2 !== undefined) {
      // /tafsir/:surah/:ayah OR /tafsir/:identifier/:surah
      const num1 = parseInt(param1, 10);
      const num2 = parseInt(param2, 10);
      if (!isNaN(num1) && !isNaN(num2)) {
        surahId = num1;
        ayahNumber = num2;
      } else {
        tafsirName = param1;
        surahId = num2;
      }
    } else {
      // /tafsir/:surah
      surahId = parseInt(param1, 10);
    }

    if (isNaN(surahId)) {
      sendError(req, res, 'INVALID_PARAMETER', 'Surah ID must be an integer.', 400);
      return;
    }

    if (ayahNumber !== undefined) {
      const result = await tafsirService.getTafsir(surahId, ayahNumber, tafsirName);
      if (!result) {
        sendError(req, res, 'TAFSIR_NOT_FOUND', `Tafsir not found for ${surahId}:${ayahNumber}.`, 404);
        return;
      }
      sendSuccess(req, res, {
        surahNumber: result.surah_id,
        ayahNumber: result.ayah_number,
        tafsir: result.tafsir_name,
        text: result.content
      });
    } else {
      const results = await tafsirService.getSurahTafsir(surahId, tafsirName);
      sendSuccess(req, res, results.map(r => ({
        surahNumber: r.surah_id,
        ayahNumber: r.ayah_number,
        tafsir: r.tafsir_name,
        text: r.content
      })), { total: results.length });
    }
  } catch (err) {
    next(err);
  }
});

// GET /v1/translations/...
tafsirRouter.get(['/translations/:param1/:param2/:param3', '/translations/:param1/:param2', '/translations/:param1'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { param1, param2, param3 } = req.params;
    let lang = (req.query.lang as string) || 'en';
    let surahId: number;
    let ayahNumber: number | undefined;

    if (param3 !== undefined) {
      lang = param1;
      surahId = parseInt(param2, 10);
      ayahNumber = parseInt(param3, 10);
    } else if (param2 !== undefined) {
      const num1 = parseInt(param1, 10);
      const num2 = parseInt(param2, 10);
      if (!isNaN(num1) && !isNaN(num2)) {
        surahId = num1;
        ayahNumber = num2;
      } else {
        lang = param1;
        surahId = num2;
      }
    } else {
      surahId = parseInt(param1, 10);
    }

    if (isNaN(surahId)) {
      sendError(req, res, 'INVALID_PARAMETER', 'Surah ID must be an integer.', 400);
      return;
    }

    if (ayahNumber !== undefined) {
      const result = await translationService.getTranslation(surahId, ayahNumber, lang);
      if (!result) {
        sendError(req, res, 'TRANSLATION_NOT_FOUND', `Translation not found for ${surahId}:${ayahNumber}.`, 404);
        return;
      }
      sendSuccess(req, res, {
        surahNumber: result.surah_id,
        ayahNumber: result.ayah_number,
        language: result.language_code,
        author: result.author_name,
        text: result.content
      });
    } else {
      const results = await translationService.getSurahTranslation(surahId, lang);
      sendSuccess(req, res, results.map(r => ({
        surahNumber: r.surah_id,
        ayahNumber: r.ayah_number,
        language: r.language_code,
        author: r.author_name,
        text: r.content
      })), { total: results.length });
    }
  } catch (err) {
    next(err);
  }
});
