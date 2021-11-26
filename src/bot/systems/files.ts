import { getNameSpace } from '@bot/libs/socket';
import { System } from 'typings';
import { prisma } from '@bot/libs/db';
import { Files } from '@prisma/client';
import { Socket } from 'socket.io';

class FilesSystem implements System {
  socket = getNameSpace('systems/files');

  insert(files: Array<Omit<Files, 'id'>>) {
    return prisma.files.createMany({
      data: files,
    });
  }

  getOne(id: number) {
    return prisma.files.findFirst({ where: { id } });
  }

  getAll() {
    return prisma.files.findMany();
  }

  delete(id: number) {
    return prisma.files.delete({ where: { id } });
  }

  sockets(client: Socket) {
    client.on('getOne', async (id: number, cb) => {
      try {
        cb(null, await this.getOne(id));
      } catch (e) {
        cb(e, null);
      }
    });
    client.on('getAll', async (cb) => {
      try {
        cb(null, await this.getAll());
      } catch (e) {
        cb(e, null);
      }
    });
    client.on('delete', async (id: number, cb) => {
      try {
        cb(null, await this.delete(id));
      } catch (e) {
        cb(e, null);
      }
    });
    client.on('insert', async (query: Array<Omit<Files, 'id'>>, cb) => {
      try {
        cb(null, await this.insert(query));
      } catch (e) {
        cb(e, null);
      }
    });
  }
}

export default new FilesSystem();
