<template>
  <div></div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { getNameSpace } from '@panel/vue/plugins/socket'

@Component
export default class TTS extends Vue {
  socket = getNameSpace({ name: 'overlays/tts', opts: { query: { isPublic: true } }})
  playing = false
  queue = []
  settings = null

  async mounted() {
    console.debug('tts overlay loaded')
    console.debug('socket:', this.socket)

    this.socket.on('tts', (text) => {
      console.debug('tts event recieved with text: ' + text)
      this.queue.push(text)
    })
    this.socket.on('settings', (settings) => {
      this.settings = settings
      this.mountResponsiveVoice()
    })
    this.setupInterval()
  }

  async mountResponsiveVoice() {
    if (!this.settings || !this.settings.token || !this.settings.token.length) return
    await this.$unloadScript(`https://code.responsivevoice.org/responsivevoice.js?key=${this.settings.token}`).catch(() => {})
    await this.$loadScript(`https://code.responsivevoice.org/responsivevoice.js?key=${this.settings.token}`).catch(() => {})
    console.debug('settings', this.settings)
    window.responsiveVoice.init()
    console.debug('ResponsiveVoice init OK')
  }

  setupInterval() {
    setInterval(() => {
      if (this.playing || !this.queue.length) return;
      this.playing = true
      const text = this.queue[0]
      window.responsiveVoice.speak(text, this.settings.voice, { 
        rate: this.settings.rate, 
        pitch: this.settings.pitch, 
        volume: this.settings.volume / 100,
        onend: () => {
          const index = this.queue.indexOf(text)
          this.queue.splice(index, 1)
          this.playing = false
        }
      })
    }, 1000)
  }
}
</script>
