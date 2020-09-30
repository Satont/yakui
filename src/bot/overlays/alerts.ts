import { System } from '@src/typings'
import { getNameSpace } from '@bot/libs/socket'
import { IEmitAlert } from '@src/typings/overlays'
import { debug } from '@bot/libs/logger'

export default new class Alerts implements System {
  socket = getNameSpace('overlays/alerts')
  clients: SocketIO.Socket[] = []

  async sockets(client: SocketIO.Socket) {
    debug('socket', 'Overlays::Alerts: some client connected to socket')
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
