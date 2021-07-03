import 'source-map-support/register';
import 'module-alias/register';

import 'reflect-metadata';
import './prototypes';

import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '@bot/libs/db';
import { error, info } from '@bot/libs/logger';
import loader, { loaded } from '@bot/libs/loader';

const start = async () => {
  await prisma.$connect();

  await import('@bot/libs/tmi');
  await import('@bot/libs/socket');
  await loader();
  listenHttp();
  info('All system loaded.');
};

function listenHttp() {
  if (!loaded) {
    return setTimeout(() => listenHttp(), 1000);
  }

  import('@bot/panel').then((p) => p.default.listen());
}

start();

process.on('unhandledRejection', (reason, promise) => {
  error(reason);
  error(promise);
});
process.on('uncaughtException', (err: Error) => {
  const date = new Date().toISOString();

  process.report?.writeReport(`uncaughtException-${date}`, err);
  error(err);

  process.exit(1);
});

process.on('SIGTERM', () => makeGracefullExit());
process.on('SIGINT', () => makeGracefullExit());

async function makeGracefullExit() {
  (await import('@bot/panel')).default.server.close();
  const tmi = (await import('@bot/libs/tmi')).default;
  tmi.bot?.chat?.quit();
  tmi.broadcaster.chat?.quit();
  (await import('@bot/libs/pubsub')).default.disconnect();
  (await import('@bot/integrations/donationalerts')).default.disconnect();
  process.exit(0);
}
