import 'module-alias/register';
import 'reflect-metadata';
import 'source-map-support/register';

import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import { chunk as makeChunk } from 'lodash';
import { isMainThread, parentPort, Worker, workerData } from 'worker_threads';
import { error } from '../libs/logger';

type Opts = { channel: string; clientId: string; accessToken: string };

export const getChatters = async (opts: Opts) => {
  if (isMainThread) {
    const value = await new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: opts });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
    return value as Array<{ username: string; id: string }>;
  }

  try {
    const data: Opts = workerData;
    const apiClient = new ApiClient({ authProvider: new StaticAuthProvider(data.clientId, data.accessToken) });

    const chatters = [];
    for (const chunk of makeChunk((await apiClient.unsupported.getChatters(data.channel))?.allChatters, 100)) {
      const users = (await apiClient.helix.users.getUsersByNames(chunk)).map((user) => ({ username: user.name, id: user.id }));

      chatters.push(...users);
    }

    parentPort?.postMessage(chatters);
    process.exit(0);
  } catch (e) {
    error(e);
  }
};

if (!isMainThread) {
  getChatters(workerData);
}
