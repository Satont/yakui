import { System } from "typings"
import { getNameSpace } from "@bot/libs/socket"
import { IEmitAlert } from 'typings/overlays'
import File from "@bot/models/File"

export default new class Alerts implements System {
  socket = getNameSpace('overlays/alerts')
  clients: SocketIO.Socket[] = []

  async sockets(client: SocketIO.Socket) {
    console.log('connected')
    const audio = await File.findOne({ where: { id: 27 }})
    this.clients.push(client)
    client.on('disconnect', () => {
      const index = this.clients.indexOf(client)
      this.clients.splice(index, 1)
    })
    this.emitAlert({
      audio: { file: audio, volume: 20 }
    })
  }

  emitAlert(data: IEmitAlert) {
    for (const client of this.clients) {
      client.emit('alert', data)
    }
  }
}
