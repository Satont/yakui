<template>
  <div>
    <b-navbar toggleable="lg" type="light" variant="dark" sticky class="flex-md-nowrap p-0 shadow">
      <b-navbar-brand class="navbar-brand col-md-1 col-lg-1 mr-0 px-3" router-link to="/">{{ title }}</b-navbar-brand>

      <b-nav align='center'>
        <b-nav-item>Viewers: {{ streamMetaData.viewers }}</b-nav-item>
        <b-nav-item>Views: {{ channelMetaData.views }}</b-nav-item>
        <b-nav-item>Title: {{ channelMetaData.title }}</b-nav-item>
        <b-nav-item>Game: {{ channelMetaData.game }}</b-nav-item>
        <b-nav-item>Uptime: {{ uptime }}</b-nav-item>
      </b-nav>


      <div class="ml-auto ml-2 mr-2">
        <b-dropdown right no-caret variant="dark" class="text-white" size="sm">
          <template v-slot:button-content>
            <b-img :src="$root.loggedUser.profile_image_url" style="width: 30px;border-radius: 30px;"></b-img>
            {{ $root.loggedUser.display_name }}
          </template>
          <b-dropdown-text>
            <b-btn block size="sm" @click="logout" variant="danger">Sign Out</b-btn>
          </b-dropdown-text>
        </b-dropdown>
      </div>

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
    startedAt: Date | null
  } = {
    viewers: 0,
    startedAt: null
  }
  channelMetaData: {
    game: string,
    title: string,
    views: number
  } = {
    views: 0,
    game: 'No data',
    title: 'No data',
  }
  updateTimeout = null

  created() {
    this.fetchMetaData()
  }

  async fetchMetaData() {
    clearTimeout(this.updateTimeout)
    this.updateTimeout = setTimeout(() => this.fetchMetaData(), 1000);
    const { data } = await axios.get('/api/v1/metaData')

    this.title = data.bot?.username?.toUpperCase() ?? 'Bot'
    document.title = this.title

    this.streamMetaData = data.streamMetaData
    this.channelMetaData = data.channelMetaData

    this.updateUptime()

  }

  updateUptime() {
    if (!this.streamMetaData.startedAt) this.uptime = 'offline';
    else {
      this.uptime = humanizeDuration(Date.now() - new Date(this.streamMetaData.startedAt).getTime(), { units: ['mo', 'd', 'h', 'm', 's'], round: true })
    }
  }

  logout() {
    localStorage.setItem('code', '')
    localStorage.setItem('accessToken', '')
    localStorage.setItem('refreshToken', '')
    localStorage.setItem('userType', '')
    window.location.replace(window.location.origin + '/public')
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
  text-align: center;
}

.navbar-light .navbar-brand:hover, .navbar-light .navbar-brand:focus {
  color: #fff;
}

.nav > li > .nav-link, .nav-link:hover, .nav-link:focus {
  cursor: default !important;
  color: #fff;
}

.nav > .nav-link {
  white-space: nowrap;
  color: #fff !important;
}

.nav-justified .nav-item {
  flex-basis: unset !important;
}

.navbar .navbar-toggler {
  top: .25rem;
  right: 1rem;
}

.navbar-light .navbar-text {
  color: #fff;
}

.navbar .form-control {
  padding: .75rem 1rem;
  border-width: 0;
  border-radius: 0;
}
</style>
