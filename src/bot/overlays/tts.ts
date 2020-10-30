import { System } from 'typings'
import { getNameSpace } from '@bot/libs/socket'
import { debug } from '@bot/libs/logger'
import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import { onChange, settings as settingsDecorator } from '../decorators'

class TTS implements System {
  socket = getNameSpace('overlays/tts')
  token = 'Kn3BDKTm'
  clients: SocketIO.Socket[] = []

  @settingsDecorator()
  settings = {
    voice: null,
    volume: 30,
    rate: 1.0,
    pitch: 1.0,
    triggerByHighlight: true,
  }

  @onChange('settings')
  async init() {
    this.clients.forEach(c => c.emit('settings', { ...this.settings, token: this.token }))
  }

  async sockets(client: SocketIO.Socket) {
    debug('socket', 'Overlays::TTS: some client connected to socket')

    client.emit('settings', { ...this.settings, token: this.token })
  }

  emitTTS(text: string) {
    this.clients.forEach(c => c.emit('tts', text))
  }

  onMessageHighlight(data: TwitchPrivateMessage) {
    if (!this.settings.triggerByHighlight) return

    this.emitTTS(data.message.value)
  }
}

export default new TTS()
