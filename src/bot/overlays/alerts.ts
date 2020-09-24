import { System } from 'typings'
import { getNameSpace } from '@bot/libs/socket'
import { IEmitAlert } from 'typings/overlays'

export default new class Alerts implements System {
  socket = getNameSpace('overlays/alerts')
  clients: SocketIO.Socket[] = []

  emitAlert(data: IEmitAlert) {
    this.clients.forEach(c => c.emit('alert', data))
  }
}
