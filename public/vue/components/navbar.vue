<template>
  <div>
    <b-navbar toggleable="lg" type="light" variant="dark" sticky="top" class="flex-md-nowrap p-0 shadow">
    <b-navbar-brand class="navbar-brand col-md-3 col-lg-2 mr-0 px-3" href="#/">{{ title }}</b-navbar-brand>
    <p>
      <b-badge variant="info">Viewers: {{ streamMetaData.viewers }}</b-badge> |
      <b-badge variant="info">Views: {{ channelMetaData.views }}</b-badge> |
      <b-badge variant="info">Title: {{ streamMetaData.title }}</b-badge> |
      <b-badge variant="info">Game: {{ streamMetaData.game }}</b-badge> |
      <b-badge variant="info">Uptime: {{ uptime }}</b-badge> |
    </p>
  </b-navbar>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import humanizeDuration from 'humanize-duration'
import axios from 'axios'

@Component
export default class NavBar extends Vue {
  title: string = 'Bot'
  uptime: string = 'offline'
  streamMetaData: {
    viewers: number,
    game: string,
    title: string,
    startedAt: Date | null
  } = {
    viewers: 0,
    game: 'No data',
    title: 'No data',
    startedAt: null
  }
  channelMetaData: {
    views: number
  } = {
    views: 0
  }

  created() {
    this.fetchMetaData()
  }

  async fetchMetaData() {
    const { data } = await axios.get('/api/v1/metaData')

    this.title = data.bot?.username?.toUpperCase() ?? 'Bot'
    document.title = this.title
    
    this.streamMetaData = data.streamMetaData
    this.channelMetaData = data.channelMetaData

    this.updateUptime()

    setTimeout(() => this.fetchMetaData(), 1000);
  }

  updateUptime() {
    if (!this.streamMetaData.startedAt) this.uptime = 'offline';
    else {
      this.uptime = humanizeDuration(Date.now() - new Date(this.streamMetaData.startedAt).getTime(), { units: ['mo', 'd', 'h', 'm', 's'], round: true })
    }
  }
}
</script>

<style scoped>
.shadow {
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
.navbar-brand {
  padding-top: .75rem;
  padding-bottom: .75rem;
  font-size: 1rem;
  background-color: rgba(0, 0, 0, .25);
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, .25);
  color: #fff;
}

.navbar-light .navbar-brand:hover, .navbar-light .navbar-brand:focus {
    color: #fff;
}

.navbar .navbar-toggler {
  top: .25rem;
  right: 1rem;
}

.navbar .form-control {
  padding: .75rem 1rem;
  border-width: 0;
  border-radius: 0;
}
</style>