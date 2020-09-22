import File from '@bot/models/File'
import { getNameSpace } from '@bot/libs/socket'
import { System } from 'typings'

export default new class Files implements System {
  socket = getNameSpace('systems/files')

  async insert(files: IInsert[]) {
    return await File.bulkCreate(files)
  }

  async getOne(id: number) {
    return await File.findOne({ where: { id } })
  }

  async getAll() {
    return await File.findAll()
  }

  async delete(id: number) {
    return await File.destroy({ where: { id } })
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
