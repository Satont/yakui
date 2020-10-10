import { File } from '@bot/entities/File'
import { getNameSpace } from '@bot/libs/socket'
import { System } from 'typings'
import { orm } from '@bot/libs/db'

export default new class Files implements System {
  socket = getNameSpace('systems/files')

  async insert(files: IInsert[]) {
    const filesEntities: File[] = []
    for (const file of files) {
      filesEntities.push(orm.em.fork().getRepository(File).create(file))
    }
    await orm.em.fork().persistAndFlush(filesEntities)
    return filesEntities
  }

  async getOne(id: number) {
    return await orm.em.fork().getRepository(File).findOne({ id })
  }

  async getAll() {
    return await orm.em.fork().getRepository(File).findAll()
  }

  async delete(id: number) {
    const file = await orm.em.fork().getRepository(File).findOne({ id })
    return await orm.em.fork().getRepository(File).removeAndFlush(file)
  }

  sockets(client: SocketIO.Socket) {
    client.on('getOne', async (id: number, cb) => {
      try {
        cb(null, await this.getOne(id))
      } catch (e) {
        cb(e, null)
      }
    })
    client.on('getAll', async (cb) => {
      try {
        cb(null, await this.getAll())
      } catch (e) {
        cb(e, null)
      }
    })
    client.on('delete', async (id: number, cb) => {
      try {
        cb(null, await this.delete(id))
      } catch (e) {
        cb(e, null)
      }
    })
    client.on('insert', async (query: IInsert[], cb) => {
      try {
        cb(null, await this.insert(query))
      } catch (e) {
        cb(e, null)
      }
    })
  }
}

interface IInsert {
  type: string;
  data: string;
  name: string;
}
