import { getNameSpace } from '@bot/libs/socket'
import { System } from 'typings'
import SocketIO from 'socket.io'
import twitch from '@bot/systems/twitch'
import tmi from '@bot/libs/tmi'
import currency from '@bot/libs/currency'
import locales from '@bot/libs/locales'

export default new class Metadata implements System {
  timeout: NodeJS.Timeout = null
  socket = getNameSpace('systems/metaData')
  clients: SocketIO.Socket[] = []

  init() {
    clearTimeout(this.timeout)
    setTimeout(() => this.init(), 5 * 1000)

    this.clients.forEach(client => {
      const data = {
        bot: { username: tmi.chatClients?.bot?.currentNick },
        channel: { ...twitch.channelMetaData, name: tmi.channel?.name },
        stream: twitch.streamMetaData,
        mainCurrency: currency.botCurrency,
        lang: locales.translate('lang.code'),
      }
      client.emit('data', data)
    })
  }
}