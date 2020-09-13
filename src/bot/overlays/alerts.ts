import { System } from "typings"
import { getNameSpace } from "@bot/libs/socket"
import { IEmitAlert } from 'typings/overlays'
import { info } from "@bot/libs/logger"

export default new class Alerts implements System {
  socket = getNameSpace('overlays/alerts')
  clients: SocketIO.Socket[] = []

  async sockets(client: SocketIO.Socket) {
    info(`Overlays::Alerts: some client connected to socket`)
    this.clients.push(client)
    client.on('disconnect', () => {
      const index = this.clients.indexOf(client)
      this.clients.splice(index, 1)
    })
  }

  emitAlert(data: IEmitAlert) {
    this.clients.forEach(c => c.emit('alert', data))
  }
}
