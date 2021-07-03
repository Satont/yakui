import express, { Request, Response } from 'express';
import history from 'connect-history-api-fallback';
import { resolve } from 'path';
import http from 'http';

import v1 from './routes/api/v1';
import { error, info } from '@bot/libs/logger';
import Authorization from '@bot/systems/authorization';
import twitch from './routes/twitch';
import morgan from 'morgan';

const app = express();
// eslint-disable-next-line prefer-const
let ready = false;
app.use(morgan('combined'));
app.use('/twitch', twitch);
app.use('/static', express.static(resolve(process.cwd(), 'public', 'dest')));
app.use('/icons', express.static(resolve(process.cwd(), 'public', 'icons')));

app.get('/login', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'login.html'));
});
app.get('/oauth', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'oauth.html'));
});
app.get('/oauth/validate', (req, res) => Authorization.validate(req, res));
app.get('/oauth/refresh', (req, res) => Authorization.refresh(req, res));

app.get('/overlay/:overlay', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'overlays.html'));
});

app.get('/overlay/:overlay/:id', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'overlays.html'));
});

app.get('/public', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'public.html'));
});

app.use('/api/v1', v1);

app.use(
  history({
    index: '/',
    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
  }),
);

app.get('/', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'panel.html'));
});

app.use((err, req: Request, res: Response, next) => {
  error(err);
  if (err['errors'] && !res.headersSent) {
    return res.status(400).send({ code: 'validation_error', message: 'Error on validation.', data: err['errors'] });
  } else if (!res.headersSent) {
    res.status(500).send(err);
  } else next();
});

const server = http.createServer(app);

function listen() {
  server.listen(process.env.PORT ? Number(process.env.PORT) : 3000, process.env.HOST ?? '0.0.0.0', () => {
    info(`Panel listening on ${process.env.PORT ? Number(process.env.PORT) : 3000} port.`);
    ready = true;
  });
}

export default {
  app,
  ready,
  server,
  listen,
};
