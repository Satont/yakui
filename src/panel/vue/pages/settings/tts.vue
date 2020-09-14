<template>
  <div>
    <b-form @submit.prevent='save'>
      <span class="text-ceter mb-2">Trigger TTS by message highlight</span>
      <b-button class="btn-block" size="sm" variant="success" v-if="settings.settings.triggerByHighlight" @click="settings.settings.triggerByHighlight = !settings.settings.triggerByHighlight">
        Enabled
      </b-button>
      <b-button class="btn-block" size="sm" variant="warning" v-if="!settings.settings.triggerByHighlight" @click="settings.settings.triggerByHighlight = !settings.settings.triggerByHighlight">
        Disabled
      </b-button>
    
      <label for='voice'>Voice</label>
      <br>
      <select id='voice' v-model="settings.settings.voice" class="form-control mb-1">
        <option v-for="voice of avaliableVoices" v-bind:key="voice" v-bind:value="voice">{{ voice }}</option>
      </select>

      <label for='volume'>Volume: {{ settings.settings.volume }}</label>
      <b-form-input id='volume' v-model='settings.settings.volume' type='range' min='1' max='100' step="1"></b-form-input>


      <label for='rate'>Rate: {{ settings.settings.rate }}</label>
      <b-form-input id='rate' v-model='settings.settings.rate' type='range' min='0.1' max='1.0' step="0.1"></b-form-input>

      <label for='pitch'>Pitch: {{ settings.settings.pitch }}</label>
      <b-form-input id='pitch' v-model='settings.settings.pitch' type='range' min='0.1' max='1.0' step="0.1"></b-form-input>

      <b-button class='btn-block' variant='info' @click="test">Test</b-button>
      <b-button class='btn-block' type='submit' variant='primary'>Save</b-button>
    </b-form>
  </div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator'
import { Settings } from '../helpers/mixins'
import { getNameSpace } from '@panel/vue/plugins/socket'

declare global {
  interface Window {
    responsiveVoice: any
  }
}

@Component({
  mixins: [Settings]
})
export default class Oauth extends Vue {
  token = ''
  socket = getNameSpace({ name: 'overlays/tts', opts: { query: { isPublic: true } }})
  avaliableVoices = []
  settings = {
    space: 'tts',
    settings: {
      voice: '',
      volume: 30,
      rate: 1.0,
      pitch: 1.0,
      triggerByHighlight: true
    }
  }

  async mounted() {
    this.socket.on('settings', settings => {
      this.token = settings.token
      this.mountResponsiveVoice()
    })
  }

  async mountResponsiveVoice() {
    await this.$loadScript(`https://code.responsivevoice.org/responsivevoice.js?key=${this.token}`).catch(() => {})

    this.avaliableVoices = window.responsiveVoice.getVoices().map(v => v.name)
    window.responsiveVoice.init()
    console.debug('ResponsiveVoice init OK')
  }

  test() {
    window.responsiveVoice.speak('Wellcome to dashboard. Добро пожаловать в панель управления!', this.settings.settings.voice, { 
      rate: this.settings.settings.rate, pitch: this.settings.settings.pitch, volume: this.settings.settings.volume / 100 
    })
  }
}
</script>
