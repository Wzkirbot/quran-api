import { Router, Request, Response, NextFunction } from 'express';
import { adhkarService } from '../../../services/adhkar.service.js';
import { sendSuccess, sendError } from '../../../utils/responseEnvelope.js';

export const adhkarRouter = Router();

// GET /v1/adhkar/categories - Get all categories of Adhkar
adhkarRouter.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await adhkarService.getCategories();
    sendSuccess(req, res, categories, { total: categories.length });
  } catch (err) {
    next(err);
  }
});

// GET /v1/adhkar/category/:slug - Get Adhkar of a specific category
adhkarRouter.get('/category/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug.trim();
    const result = await adhkarService.getAdhkarByCategory(slug);
    sendSuccess(req, res, result.items, {
      category: result.category,
      total: result.total
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      sendError(req, res, 'CATEGORY_NOT_FOUND', err.message, 404);
    } else {
      next(err);
    }
  }
});

// GET /v1/adhkar/random - Get a random Dhikr
adhkarRouter.get('/random', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await adhkarService.getRandomAdhkar();
    sendSuccess(req, res, item);
  } catch (err) {
    next(err);
  }
});

// GET /v1/adhkar/duas - Get Quranic and Prophetic Duas
adhkarRouter.get('/duas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string;
    const items = await adhkarService.getDuas(category);
    sendSuccess(req, res, items, { total: items.length });
  } catch (err) {
    next(err);
  }
});

// GET /v1/adhkar/search?q=... - Search inside Adhkar
adhkarRouter.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length < 2) {
      sendError(req, res, 'INVALID_QUERY', 'Search query "q" must be at least 2 characters long.', 400);
      return;
    }
    const results = await adhkarService.searchAdhkar(q);
    sendSuccess(req, res, results, { total: results.length, query: q });
  } catch (err) {
    next(err);
  }
});
