import { System } from "typings"
import { getNameSpace } from "@bot/libs/socket"

export default new class Alerts implements System {
  socket = getNameSpace('overlays/alerts')

  sockets(client: SocketIO.Socket) {
    client.emit('alert', { someObjectData: 'qwe'})
  }
}
