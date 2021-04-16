import '../moduleAlias';
import 'reflect-metadata';
import 'source-map-support/register';

import { isMainThread, parentPort, Worker, workerData } from 'worker_threads';
import { error } from '../libs/logger';
import { MikroORM } from '@mikro-orm/core';
import { User } from '../entities/User';

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
    const orm = await MikroORM.init();
    const repository = orm.em.getRepository(User);
    const usersForUpdate: User[] = [];
    console.log(data);
    for (const chatter of data.chatters) {
      const user =
        (await repository.findOne(Number(chatter.id))) ||
        repository.assign(new User(), { id: Number(chatter.id), username: chatter.username });

      const updatePoints = new Date().getTime() - new Date(user.lastWatchedPoints).getTime() >= data.points.interval && data.points.enabled;

      if (data.points.perWatch && data.points.interval && updatePoints) {
        user.lastWatchedPoints = new Date().getTime();
        user.points += data.points.perWatch;
      }

      user.watched += 1 * 60 * 1000;
      usersForUpdate.push(user);
    }

    await repository.persistAndFlush(usersForUpdate);
    parentPort?.postMessage('Done');
    process.exit(0);
  } catch (e) {
    error(e);
  }
};

if (!isMainThread) {
  countWatched(workerData);
}
