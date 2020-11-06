<template>
  <b-list-group>
    <div v-if="events.length === 0" aria-atomic="true" class="alert alert-danger m-2 p-2">Eventlist is currently empty</div>
    <b-list-group-item v-for="event of events.filter(e => avaliableEvents.includes(e.name))" v-bind:key="event.id">
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">
          <i
            v-bind:class="{
              fas: true,
              'fa-dollar-sign': event.name === 'tip',
              'fa-star-half-alt': event.name === 'sub',
              'fa-star': event.name === 'resub',
              'fa-user-plus': event.name === 'newmod',
              'fa-user-minus': event.name === 'removemod',
              'fa-random': event.name === 'hosted' || event.name === 'raided',
              'fa-heart': event.name === 'follow'
            }">
            </i>
          {{ event.data.username || '' }}
        </h5>
        <small>{{ humanize(event.timestamp || Date.now()) }}</small>
      </div>
      <div>
        <span v-if="event.data.message" style="font-size: 14px;">{{ event.data.message }}</span><br v-if="event.data.message">
        <span v-if="event.name === 'tip'">{{ event.data.amount }}{{ event.data.currency }}</span>
        <span v-if="event.name === 'resub' || event.name === 'sub'">
          {{ event.data.overallMonths || 1 }} months, {{ event.data.tier || 1 }} tier
        </span>
        <span v-if="event.name === 'hosted' || event.name === 'raided'">
          {{ event.name }} with {{ event.data.viewers }} viewers
        </span>
      </div>
    </b-list-group-item>
  </b-list-group>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { EventList } from '@src/bot/entities/EventList'
import humanizeDuration from 'humanize-duration'
import { Socket } from 'vue-socket.io-extended'
import { getNameSpace } from '../plugins/socket'
import { sortBy } from 'lodash'

@Component({
  props: {
    id: Number
  }
})
export default class Events extends Vue {
  title = 'EventList'
  events: EventList[] = []
  socket = getNameSpace({ name: 'widgets/eventlist' })
  avaliableEvents = ['tip', 'sub', 'resub', 'newmod', 'removemod', 'hosted', 'raided', 'follow']

  async created() {
    const { data } = await this.$axios.get('/eventlist')
    this.events = data
  }

  humanize(val) {
    return humanizeDuration(Date.now() - val, { units: ['mo', 'd', 'h', 'm', 's'], round: true, language: this.$store.state.metaData.lang })
  }

  mounted() {
    this.socket.off('event').on('event', (event) => {
      this.events.unshift(event)
    })
  }
}
</script>
<style scoped>
.list-group {
  overflow: scroll;
  height: 100%;
}
</style>
