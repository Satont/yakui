import { getNameSpace } from '@bot/libs/socket'
import { System } from 'typings'
import currency from '../libs/currency'
import locales from '../libs/locales'
import tmi from '../libs/tmi'
import twitch from './twitch'

export default new class MetaData implements System {
  socket = getNameSpace('systems/metaData')
  clients: SocketIO.Socket[] = []
  timeout: NodeJS.Timeout = null

  init() {
    this.sendMetaData()
  }

  getData() {
    return {
      bot: { username: tmi.chatClients?.bot?.currentNick },
      channel: { ...twitch.channelMetaData, name: tmi.channel?.name },
      stream: {
        ...twitch.streamMetaData,
        startedAt: twitch.uptime,
      },
      mainCurrency: currency.botCurrency,
      lang: locales.translate('lang.code'),
    }
  }

  sockets(client: SocketIO.Socket) {
    client.on('getData', cb => cb(this.getData()))
  }

  sendMetaData() {
    clearTimeout(this.timeout)
    setTimeout(() => this.sendMetaData(), 5 * 1000)
    this.clients.forEach(c => c.emit('data', this.getData()))
  }
}
