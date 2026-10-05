import { Router, Request, Response, NextFunction } from 'express';
import { quranService } from '../../../services/quran.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';

export const ayahsRouter = Router();

// GET /v1/ayahs/random - Get a random Ayah from the verified local dataset
ayahsRouter.get('/random', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ayah = await quranService.getRandomAyah();
    const surah = await quranService.getSurahById(ayah.surah_id);
    sendSuccess(req, res, { ...ayah, surah });
  } catch (err) {
    next(err);
  }
});

// GET /v1/ayahs/:reference - Get Ayah by reference ("2:255", "2/255", or global number 1-6236)
ayahsRouter.get('/:reference', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reference = req.params.reference.trim();
    const ayah = await quranService.getAyahByReference(reference);

    if (!ayah) {
      sendError(req, res, 'AYAH_NOT_FOUND', `Ayah with reference "${reference}" was not found.`, 404);
      return;
    }

    const surah = await quranService.getSurahById(ayah.surah_id);
    sendSuccess(req, res, { ...ayah, surah });
  } catch (err) {
    next(err);
  }
});
