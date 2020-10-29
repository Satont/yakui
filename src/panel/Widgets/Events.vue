<template>
  <b-card title="Title" no-body header-tag="header" footer-tag="footer" class="my-bg-dark mt-3">
    <template v-slot:header>
      <div class="widget-header">
        <div class="name-widget"><EventsIcon />Events</div>
      </div>
    </template>
    <b-card-body class="p-0 card-list">
      <div v-for="event of events" v-bind:key="event.id">
        <Follow 
          v-if="event.name === 'follow'" 
          :username="event.data.username" 
          :date="computeTime(event.timestamp)" 
        />
        <Subscribe 
          v-if="event.name === 'sub'" 
          :username="event.data.username" 
          :date="computeTime(event.timestamp)" 
          :tier="event.data.tier" 
        />
        <Raid 
          v-if="event.name === 'raided'" 
          :username="event.data.username" 
          :date="computeTime(event.timestamp)" 
          :viewers="event.data.viewers" 
        />
        <Donation 
          v-if="event.name === 'tip'" 
          :username="event.data.username" 
          :date="computeTime(event.timestamp)"
          :amount="event.data.amount"
          :currency="event.data.currency"
          :message="event.data.message"
          :service="event.data.service || 'unknown'"
        />
      </div>
    </b-card-body>
  </b-card>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator'
import EventsIcon from '../assets/icons/Events.svg'
import Follow from './EventsType/Follow.vue'
import Subscribe from './EventsType/Subscribe.vue'
import Raid from './EventsType/Raid.vue'
import Donation from './EventsType/Donation.vue'
import { getNameSpace } from '@panel/vue/plugins/socket'

@Component({
  name: 'Events',
  components: {
    EventsIcon,
    Follow,
    Subscribe,
    Raid,
    Donation,
  },
})
export default class Events extends Vue {
  socket = getNameSpace({ name: 'widgets/eventlist' })
  events = []

  created() {
    this.socket.emit('getAll', data => {
      this.events = data
      console.log(data)
    })
    this.socket.off('event').on('event', (event) => this.events.unshift(event))
  }

  computeTime(timestamp) {
    return this.$dayjs(timestamp).from(this.$dayjs())
  }
}
</script>

<style scoped>
.stream-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.card-list {
  overflow: auto;
}
</style>
