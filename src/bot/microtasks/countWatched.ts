import '../moduleAlias';
import 'reflect-metadata';
import 'source-map-support/register';

import { isMainThread, parentPort, Worker, workerData } from 'worker_threads';
import { error } from '../libs/logger';
import { PrismaClient } from '@prisma/client';

type Opts = {
  chatters: Array<{ username: string; id: string }>;
  points: {
    enabled: boolean;
    perWatch: number;
    interval: number;
  };
};

export const countWatched = async (opts: Opts) => {
  if (isMainThread) {
    return await new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: opts });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  try {
    const data: Opts = workerData;
    const prisma = new PrismaClient();

    for (const chatter of data.chatters) {
      const user = await prisma.users.upsert({
        where: {
          id: Number(chatter.id),
        },
        update: {},
        create: { id: Number(chatter.id), username: chatter.username, watched: 1 * 60 * 1000 },
      });

      const updatePoints =
        new Date().getTime() - new Date(user.lastWatchedPoints.toString()).getTime() >= data.points.interval && data.points.enabled;

      if (data.points.perWatch && data.points.interval && updatePoints) {
        user.lastWatchedPoints = BigInt(new Date().getTime());
        user.points += data.points.perWatch;
      }

      user.watched = BigInt(Number(user.watched) + 1 * 60 * 1000);

      await prisma.users.update({
        where: { id: user.id },
        data: user,
      });
    }

    parentPort?.postMessage('Done');
    process.exit(0);
  } catch (e) {
    error(e);
  }
};

if (!isMainThread) {
  countWatched(workerData);
}
