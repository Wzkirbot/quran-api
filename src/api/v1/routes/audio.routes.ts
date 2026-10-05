import { Router, Request, Response, NextFunction } from 'express';
import { audioService } from '../../../services/audio.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';
import { parseIntegerParam } from '../../../utils/validation.js';

export const audioRouter = Router();

// GET /v1/reciters - List all Quranic reciters / Sheikhs
audioRouter.get('/reciters', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reciters = await audioService.getReciters();
    sendSuccess(req, res, reciters, { total: reciters.length });
  } catch (err) {
    next(err);
  }
});

// GET /v1/reciters/:id - Get specific reciter info
audioRouter.get('/reciters/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id.trim();
    const reciter = await audioService.getReciter(id);
    if (!reciter) {
      sendError(req, res, 'RECITER_NOT_FOUND', `Reciter with ID "${id}" was not found.`, 404);
      return;
    }
    sendSuccess(req, res, reciter);
  } catch (err) {
    next(err);
  }
});

// GET /v1/audio/surah/:reciterId/:surahId - Audio track for full Surah
audioRouter.get('/audio/surah/:reciterId/:surahId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reciterId = req.params.reciterId.trim();
    const surahId = parseIntegerParam(req.params.surahId, { min: 1, max: 114 });

    if (surahId === null) {
      sendError(req, res, 'INVALID_SURAH_ID', 'Surah ID must be an integer between 1 and 114.', 400);
      return;
    }

    const track = await audioService.getSurahAudio(reciterId, surahId);
    if (!track) {
      sendError(req, res, 'AUDIO_NOT_FOUND', `Audio track not found for reciter "${reciterId}" and surah ${surahId}.`, 404);
      return;
    }

    sendSuccess(req, res, track);
  } catch (err) {
    next(err);
  }
});

// GET /v1/audio/ayah/:reciterId/:reference - Audio track for specific Ayah (e.g. 1:1 or 2:255)
audioRouter.get(['/audio/ayah/:reciterId/:param1/:param2', '/audio/ayah/:reciterId/:param1'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reciterId = req.params.reciterId.trim();
    const { param1, param2 } = req.params;

    let surahId: number;
    let ayahNumber: number;

    if (param2 !== undefined) {
      surahId = parseInt(param1, 10);
      ayahNumber = parseInt(param2, 10);
    } else if (param1.includes(':')) {
      const parts = param1.split(':');
      surahId = parseInt(parts[0], 10);
      ayahNumber = parseInt(parts[1], 10);
    } else {
      sendError(req, res, 'INVALID_REFERENCE', 'Ayah reference must be formatted as "surah:ayah" or "surah/ayah".', 400);
      return;
    }

    if (isNaN(surahId) || isNaN(ayahNumber)) {
      sendError(req, res, 'INVALID_REFERENCE', 'Surah and Ayah numbers must be valid integers.', 400);
      return;
    }

    const track = await audioService.getAyahAudio(reciterId, surahId, ayahNumber);
    if (!track) {
      sendError(req, res, 'AUDIO_NOT_FOUND', `Ayah audio not found for reciter "${reciterId}" at ${surahId}:${ayahNumber}.`, 404);
      return;
    }

    sendSuccess(req, res, track);
  } catch (err) {
    next(err);
  }
});
