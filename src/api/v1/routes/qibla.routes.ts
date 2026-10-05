import { Router, Request, Response } from 'express';
import { qiblaService } from '../../../services/qibla.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';

export const qiblaRouter = Router();

// GET /v1/qibla/cities - List major cities
qiblaRouter.get('/qibla/cities', (_req: Request, res: Response) => {
  const cities = qiblaService.getMajorCities();
  sendSuccess(_req, res, cities, { total: cities.length });
});

// GET /v1/qibla/city/:cityId - Get Qibla for a specific preset city
qiblaRouter.get('/qibla/city/:cityId', (req: Request, res: Response) => {
  const cityId = req.params.cityId.trim();
  const result = qiblaService.getCityQibla(cityId);

  if (!result) {
    sendError(req, res, 'CITY_NOT_FOUND', `City with identifier "${cityId}" was not found in presets.`, 404);
    return;
  }

  sendSuccess(req, res, result);
});

// GET /v1/qibla - Calculate Qibla from custom coordinates (latitude & longitude)
qiblaRouter.get('/qibla', (req: Request, res: Response) => {
  const latStr = req.query.latitude || req.query.lat;
  const lngStr = req.query.longitude || req.query.lng || req.query.lon;

  if (!latStr || !lngStr) {
    sendError(
      req,
      res,
      'MISSING_COORDINATES',
      'Both "latitude" (-90 to 90) and "longitude" (-180 to 180) query parameters are required.',
      400
    );
    return;
  }

  const latitude = parseFloat(latStr as string);
  const longitude = parseFloat(lngStr as string);

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    sendError(req, res, 'INVALID_LATITUDE', 'Latitude must be a valid number between -90 and 90.', 400);
    return;
  }

  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    sendError(req, res, 'INVALID_LONGITUDE', 'Longitude must be a valid number between -180 and 180.', 400);
    return;
  }

  const result = qiblaService.calculateQibla(latitude, longitude);
  sendSuccess(req, res, result);
});
