import { System } from 'typings'
import { getNameSpace } from '@bot/libs/socket'
import { IEmitAlert } from 'typings/overlays'
import { debug } from '@bot/libs/logger'

export default new class Alerts implements System {
  socket = getNameSpace('overlays/alerts')
  clients: SocketIO.Socket[] = []

  async sockets() {
    debug('socket', 'Overlays::Alerts: some client connected to socket')
    debug('socket', `Overlays::Alerts: clients length: ${this.clients.length}`)
  }

  async emitAlert(data: IEmitAlert) {
    console.log(this.clients.length)
    this.clients.forEach(c => c.emit('alert', data))
  }
}
