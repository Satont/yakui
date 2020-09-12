import { System } from "typings"
import { getNameSpace } from "@bot/libs/socket"

export default new class Alerts implements System {
  socket = getNameSpace('overlays/alerts')
  clients: SocketIO.Socket[] = []

  sockets(client: SocketIO.Socket) {
    this.clients.push(client)
    client.on('disconnect', () => this.clients.unshift(client)) // delete this socket from array for fix memory leak
    client.emit('alert', { someObjectData: 'qwe'})
  }
}
