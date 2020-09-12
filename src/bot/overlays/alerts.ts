import { System } from "typings"
import { getNameSpace } from "@bot/libs/socket"
import { IEmitAlert } from 'typings/overlays'

export default new class Alerts implements System {
  socket = getNameSpace('overlays/alerts')
  clients: SocketIO.Socket[] = []

  sockets(client: SocketIO.Socket) {
    this.clients.push(client)
    client.on('disconnect', () => this.clients.unshift(client)) // delete this socket from array for possible memory leak
    client.emit('alert', { someObjectData: 'qwe'})
  }

  emitAlert(data: IEmitAlert) {
    for (const client of this.clients) {
      client.emit('alert', data)
    }
  }
}
