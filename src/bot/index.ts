import './moduleAlias';
import 'reflect-metadata';
import 'source-map-support/register';
import dotenv from 'dotenv';
dotenv.config();

import { start as dbConnect, orm } from '@bot/libs/db';
import { error } from '@bot/libs/logger';

const start = async () => {
  await dbConnect();
  if (!(await orm.isConnected())) return setTimeout(() => start(), 1000);

  await import('@bot/libs/tmi');
  await import('@bot/panel');
  await import('@bot/libs/socket');
};

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
  (await import('@bot/panel')).server.close();
  const tmi = (await import('@bot/libs/tmi')).default;
  await tmi.bot?.chat?.quit();
  await tmi.broadcaster.chat?.quit();
  await (await import('@bot/libs/pubsub')).default.disconnect();
  await (await import('@bot/integrations/donationalerts')).default.disconnect();
}
