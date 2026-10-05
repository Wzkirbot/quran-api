import { Router, Request, Response } from 'express';
import { qiblaService } from '../../../services/qibla.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';

export const qiblaRouter = Router();

/**
 * Validates and extracts latitude and longitude from request query or body.
 */
function validateCoordinates(
  latInput: unknown,
  lngInput: unknown,
  req: Request,
  res: Response
): { latitude: number; longitude: number } | null {
  if (latInput === undefined || latInput === null || lngInput === undefined || lngInput === null) {
    sendError(
      req,
      res,
      'LOCATION_REQUIRED',
      'Location coordinates are required. Both "latitude" (-90 to 90) and "longitude" (-180 to 180) must be provided from device geolocation.',
      400
    );
    return null;
  }

  const latStr = String(latInput).trim();
  const lngStr = String(lngInput).trim();

  if (latStr === '' || lngStr === '') {
    sendError(
      req,
      res,
      'LOCATION_REQUIRED',
      'Coordinates cannot be empty. Please provide valid latitude and longitude.',
      400
    );
    return null;
  }

  const latitude = Number(latStr);
  const longitude = Number(lngStr);

  if (!Number.isFinite(latitude) || isNaN(latitude) || latitude < -90 || latitude > 90) {
    sendError(
      req,
      res,
      'INVALID_LATITUDE',
      'Latitude must be a valid finite number between -90 and 90 degrees.',
      400
    );
    return null;
  }

  if (!Number.isFinite(longitude) || isNaN(longitude) || longitude < -180 || longitude > 180) {
    sendError(
      req,
      res,
      'INVALID_LONGITUDE',
      'Longitude must be a valid finite number between -180 and 180 degrees.',
      400
    );
    return null;
  }

  return { latitude, longitude };
}

// GET /v1/qibla - Calculate Qibla from real device geolocation coordinates
qiblaRouter.get('/qibla', (req: Request, res: Response) => {
  const latParam = req.query.latitude ?? req.query.lat;
  const lngParam = req.query.longitude ?? req.query.lng ?? req.query.lon;

  const coords = validateCoordinates(latParam, lngParam, req, res);
  if (!coords) return;

  const result = qiblaService.calculateQibla(coords.latitude, coords.longitude);
  sendSuccess(req, res, result);
});

// POST /v1/qibla - Calculate Qibla with JSON payload { latitude, longitude }
qiblaRouter.post('/qibla', (req: Request, res: Response) => {
  const body = req.body || {};
  const latParam = body.latitude ?? body.lat;
  const lngParam = body.longitude ?? body.lng ?? body.lon;

  const coords = validateCoordinates(latParam, lngParam, req, res);
  if (!coords) return;

  const result = qiblaService.calculateQibla(coords.latitude, coords.longitude);
  sendSuccess(req, res, result);
});

// GET /v1/qibla/cities - (Deprecated preset metadata, client should use GPS coordinates)
qiblaRouter.get('/qibla/cities', (_req: Request, res: Response) => {
  const cities = qiblaService.getMajorCities();
  sendSuccess(_req, res, cities, { total: cities.length, notice: 'Deprecated: Qibla calculation strictly expects user GPS coordinates.' });
});

// GET /v1/qibla/city/:cityId - (Deprecated preset lookup, preserved for backward compatibility)
qiblaRouter.get('/qibla/city/:cityId', (req: Request, res: Response) => {
  const cityId = req.params.cityId.trim();
  const result = qiblaService.getCityQibla(cityId);

  if (!result) {
    sendError(req, res, 'CITY_NOT_FOUND', `City with identifier "${cityId}" was not found in presets.`, 404);
    return;
  }

  sendSuccess(req, res, result, { notice: 'Deprecated: Qibla calculation strictly expects user GPS coordinates.' });
});

