import File from '@bot/models/File'
import { getNameSpace } from '@bot/libs/socket'
import { System } from 'typings'

export default new class Files implements System {
  socket = getNameSpace('systems/files')

  async insert(file: IInsert) {
    return await File.create(file)
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
    const self = this
    client.on('getOne', async (id: number, cb: Function) => {
      try {
        cb(null, await self.getOne(id))
      } catch (e) {
        cb(e, null)
      }
    })
    client.on('getAll', async function (cb: Function) {
      console.log('getAll called')
      try {
        cb(null, await self.getAll())
      } catch (e) {
        cb(e, null)
      }
    })
    this.socket.on('delete', async (id: number,cb: Function) => {
      try {
        cb(null, await self.delete(id))
      } catch (e) {
        cb(e, null)
      }
    })
    this.socket.on('insert', async (query: IInsert, cb: Function) => {
      console.log(query)
      try {
        cb(null, await self.insert(query))
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
