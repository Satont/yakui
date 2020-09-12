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
import * as Events from 'typings/events'

@Component
export default class Alerts extends Vue {
  socket = getNameSpace({ name: 'overlays/alerts', opts: { query: { isPublic: true } } })
  playing = false
  alerts: Array<
    Events.IWebHookModeratorRemove
    | Events.IWebHookModeratorAdd
    | Events.IWebHookUserFollow
    | Events.IWebHookStreamChanged
    | Events.INewSubscriber
    | Events.INewResubscriber
  > = []

  mounted() {
    console.log('alerts overlay loaded')
    this.socket.on('alert', async (data) => {
      this.alerts.push(data)
    })
    this.setupInterval()
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
