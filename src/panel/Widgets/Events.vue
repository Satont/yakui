<template>
  <b-card title="Title" no-body header-tag="header" footer-tag="footer" class="my-bg-dark mt-3">
    <template v-slot:header>
      <div class="chat-header">
        <div class="name-widget"><EventsIcon />Events</div>
      </div>
    </template>
    <b-card-body class="p-0 card-list">
      <Follow />
      <Follow />
      <Follow />
      <Subscribe />
      <Raid />
      <Raid />
      <Subscribe />
      <Follow />
      <Follow />
      <Donation />
      <Follow />
      <Donation />
      <Follow />
      <Donation />
      <Follow />
      <Follow />
      <Follow />
      <Subscribe />
      <Raid />
      <Raid />
      <Subscribe />
      <Follow />
      <Follow />
      <Donation />
      <Follow />
      <Donation />
      <Follow />
      <Donation />
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
export default class Events extends Vue {}
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
