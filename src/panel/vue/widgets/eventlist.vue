<template>
  <b-list-group>
    <b-list-group-item v-for="event of events" v-bind:key="event.id">
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
import { Vue, Component } from 'vue-property-decorator'
import axios from '../components/axios'
import EventList from '../../../bot/models/EventList'
import humanizeDuration from 'humanize-duration'

@Component({
  props: {
    id: Number
  }
})
export default class Chat extends Vue {
  title = 'EventList'
  events: EventList[] = []
  amount = 100

  async created() {
    this.getEvents()
    this.heartbeat()
  }

  async getEvents() {
    const { data } = await axios.get('/eventlist')
    this.events = data
  }

  async heartbeat() {
    setTimeout(() => this.heartbeat(), 2000);

    const { data } = await axios.post('/eventlist/heartbeat', { timestamp: this.events[0]?.timestamp })

    if (!data) {
      this.getEvents()
    }
  }

  humanize(val) {
    return humanizeDuration(Date.now() - val, { units: ['mo', 'd', 'h', 'm', 's'], round: true, language: (this.$root as any).metadata.lang })
  }
}
</script>
<style scoped>
.list-group {
  overflow: scroll;
  height: 100%;
}
</style>
