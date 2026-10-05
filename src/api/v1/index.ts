import { Router } from 'express';
import { surahsRouter } from './routes/surahs.routes.js';
import { ayahsRouter } from './routes/ayahs.routes.js';
import { juzRouter } from './routes/juz.routes.js';
import { pagesRouter } from './routes/pages.routes.js';
import { searchRouter } from './routes/search.routes.js';
import { adhkarRouter } from './routes/adhkar.routes.js';
import { tafsirRouter } from './routes/tafsir.routes.js';
import { audioRouter } from './routes/audio.routes.js';
import { qiblaRouter } from './routes/qibla.routes.js';
import { systemRouter } from './routes/system.routes.js';

export const v1Router = Router();

v1Router.use('/surahs', surahsRouter);
v1Router.use('/ayahs', ayahsRouter);
v1Router.use('/juz', juzRouter);
v1Router.use('/pages', pagesRouter);
v1Router.use('/search', searchRouter);
v1Router.use('/adhkar', adhkarRouter);
v1Router.use('/duas', (req, res, next) => {
  req.url = '/duas' + (req.url === '/' ? '' : req.url);
  adhkarRouter(req, res, next);
});
v1Router.use('/', audioRouter);
v1Router.use('/', qiblaRouter);
v1Router.use('/', tafsirRouter);
v1Router.use('/', systemRouter);
