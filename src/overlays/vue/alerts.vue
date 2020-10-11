<template>
  <div>
    <div v-if="playing && currentAlert">
      <audio ref="audio" muted v-if="currentAlert.audio" :src="currentAlert.audio.file.data"></audio>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { getNameSpace } from '@panel/vue/plugins/socket'
import { IEmitAlert } from 'typings/overlays'

@Component
export default class Alerts extends Vue {
  socket = getNameSpace({ name: 'overlays/alerts', opts: { query: { isPublic: true } } })
  playing = false
  alerts: Array<IEmitAlert> = []
  currentAlert: IEmitAlert = null
  interval = null

  mounted() {
    console.debug('alerts overlay loaded')
    console.debug('socket:', this.socket)
    this.alerts = []
    this.socket.on('alert', async (data: IEmitAlert) => {
      console.debug('new event', data)
      this.alerts.push(data)
    })
    this.setupInterval()
  }

  setupInterval() {
    clearInterval(this.interval)
    this.interval = setInterval(() => {
      if (this.playing || !this.alerts.length) return;
      console.debug('started', this.alerts)
      this.alerts.forEach(async alert => {
        this.playing = true
        this.currentAlert = alert
        console.debug('currentAlert', this.currentAlert)
        await this.$nextTick(async () => {
            if (alert.audio) {
              const audio = this.$refs.audio as HTMLMediaElement
              if (!audio) return;
              audio.volume = alert.audio.volume ? Number(alert.audio.volume) / 100 : 1
              audio.src = alert.audio.file.data
              if (audio.error) return
              audio.onended = () => {
                this.playing = false
                this.currentAlert = null
                const index = this.alerts.indexOf(alert)
                this.alerts.splice(index, 1)
                console.debug('ended', this.alerts)
              }
              audio.oncanplaythrough = () => audio.play().then(() => audio.muted = false)
          }
        })
      })
    }, 500)
  }
}
</script>
