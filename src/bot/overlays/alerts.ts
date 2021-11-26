import { System } from 'typings';
import { getNameSpace } from '@bot/libs/socket';
import { IEmitAlert } from 'typings/overlays';
import { debug } from '@bot/libs/logger';
import { Socket } from 'socket.io';

class Alerts implements System {
  socket = getNameSpace('overlays/alerts');
  clients: Socket[] = [];

  async sockets() {
    debug('socket', 'Overlays::Alerts: some client connected to socket');
    debug('socket', `Overlays::Alerts: clients length: ${this.clients.length}`);
  }

  async emitAlert(data: IEmitAlert) {
    this.clients.forEach((c) => c.emit('alert', data));
  }
}

export default new Alerts();
