import { System } from 'typings'
import { getNameSpace } from '@bot/libs/socket'
import { info } from '@bot/libs/logger'
import Settings from '@bot/models/Settings'
import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'

export default new class TTS implements System {
  socket = getNameSpace('overlays/tts')
  clients: SocketIO.Socket[] = []
  token = 'Kn3BDKTm'
  settings: {
    voice: string | null,
    volume: number,
    rate: number,
    pitch: number,
    triggerByHighlight: boolean,
  } = {
    voice: null,
    volume: 30,
    rate: 1.0,
    pitch: 1.0,
    triggerByHighlight: true,
  }

  async init() {
    const settings: Settings = await Settings.findOne({
      where: { space: 'tts', name: 'settings' },
    })

    if (!settings) return

    this.settings = settings.value

    this.clients.forEach(c => c.emit('settings', { ...this.settings, token: this.token }))
  }

  async sockets(client: SocketIO.Socket) {
    info(`Overlays::TTS: some client connected to socket`)
    this.clients.push(client)
    client.on('disconnect', () => {
      const index = this.clients.indexOf(client)
      this.clients.splice(index, 1)
    })
    client.emit('settings', { ...this.settings, token: this.token })
  }

  emitTTS(text: string) {
    this.clients.forEach(c => c.emit('tts', text))
  }

  onMessageHighlight(data: TwitchPrivateMessage) {
    if (!this.settings.triggerByHighlight) return

    this.emitTTS(data.message.value)
  }

  async listenDbUpdates() {
    Settings.afterSave(instance => {
      if (instance.space !== 'tts') return
      this.init()
    })
  }
}
