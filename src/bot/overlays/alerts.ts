import { System } from "typings"
import { getNameSpace } from "@bot/libs/socket"

export default new class Alerts implements System {
  socket = getNameSpace('overlays/alerts')

  sockets(client: SocketIO.Socket) {
    client.on('test', () => console.log('test'))
    setInterval(() => client.emit('alert', { someObjectData: 'qwe'}), 1000)
  }
}
