<template>
  <div>
    <div v-if="!playing">

    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Overlay from '@bot/models/Overlay'
import axios from 'axios'
import { getNameSpace } from '@panel/vue/plugins/socket'

@Component
export default class Alerts extends Vue {
  socket = getNameSpace({ name: 'overlays/alerts', opts: { query: { isPublic: true } } })
  playing = false
  alerts = []

  mounted() {
    console.log('alerts overlay loaded')
    this.socket.on('alert', async (data) => {
      console.log(data)
      this.alerts.push(data)
    })
    //this.setupInterval()
  }

  setupInterval() {
    setInterval(() => {
      if (this.playing) return;

      for (const alert of this.alerts) {
        
      }
    }, 100)
  }
}
</script>
