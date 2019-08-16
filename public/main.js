import Vue from 'vue'
import VueRouter from 'vue-router'
import humanizeDuration from 'humanize-duration'
import moment from 'moment'
import VueClipboard from 'vue-clipboard2'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import Commands from './vue/commands/list.vue'
import createCommand from './vue/commands/create.vue'
import editCommand from './vue/commands/edit.vue'

import keywords from './vue/keywords/list.vue'
import createKeyword from './vue/keywords/create.vue'
import editKeyword from './vue/keywords/edit.vue'

import Variables from './vue/variables/list.vue'
import createVariable from './vue/variables/create.vue'
import editVariable from './vue/variables/edit.vue'

import timers from './vue/timers/list.vue'
import createTimer from './vue/timers/create.vue'
import editTimer from './vue/timers/edit.vue'

import overlays from './vue/overlays/list.vue'
import createOverlay from './vue/overlays/create.vue'
import editOverlay from './vue/overlays/edit.vue'

import moderation from './vue/settings/moderation.vue'
import variablelist from './vue/single/variables.vue'

import SocketIO from 'socket.io-client'
import VueSocketIO from 'vue-socket.io'
import cooldownModal from './vue/components/cooldownmodal.vue'
import settingsUsers from './vue/settings/users.vue'
import notable from './vue/settings/notable.vue'

import donationalerts from './vue/integrations/donationalerts.vue'
import streamlabs from './vue/integrations/streamlabs.vue'
import qiwi from './vue/integrations/qiwi.vue'
import spotify from './vue/integrations/spotify.vue'

Vue.use(new VueSocketIO({
  debug: true,
  connection: SocketIO('/')
}))
Vue.component('variables', variablelist)
Vue.use(VueRouter)
Vue.component('cooldownModal', cooldownModal)
Vue.use(VueClipboard)
Vue.use(BootstrapVue)

const routes = [
  { path: '/', component: Commands },

  { path: '/commands', component: Commands },
  { path: '/commands/create', component: createCommand },
  { path: '/commands/edit/:id', name: 'editCommand', component: editCommand },

  { path: '/keywords', component: keywords },
  { path: '/keywords/create', component: createKeyword },
  { path: '/keywords/edit/:id', name: 'editKeyword', component: editKeyword },

  { path: '/variables', component: Variables },
  { path: '/variables/create', component: createVariable },
  { path: '/variables/edit/:id', name: 'editVariable', component: editVariable },

  { path: '/timers', component: timers },
  { path: '/timers/create', component: createTimer },
  { path: '/timers/edit/:id', name: 'editTimer', component: editTimer },

  { path: '/overlays', component: overlays },
  { path: '/overlays/create', component: createOverlay },
  { path: '/overlays/edit/:id', name: 'editOverlay', component: editOverlay },

  { path: '/settings/moderation', component: moderation },
  { path: '/settings/users', component: settingsUsers },
  { path: '/settings/notable', component: notable },

  { path: '/integrations/donationalerts', component: donationalerts },
  { path: '/integrations/streamlabs', component: streamlabs },
  { path: '/integrations/qiwi', component: qiwi },
  { path: '/integrations/spotify', component: spotify }
]

const router = new VueRouter({
  routes
})

new Vue({
  data: function () {
    return {
      followers: 0,
      viewers: 0,
      views: 0,
      subscribers: 0,
      game: '',
      title: '',
      uptime: 0,
      channel: ''
    }
  },

  router,
  template: `
  <div>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <router-link to="/" class="navbar-brand mb-0 h1">{{ channel }}</router-link>
        <div class="ml-left">
          <span class="badge badge-light">Game: {{ game }}</span>
          <span class="badge badge-light">Title: {{ title }}</span>
          <span class="badge badge-dark">Viewers: {{ viewers }}</span>
          <span class="badge badge-danger">Subscribers: {{ subscribers }}</span>
          <span class="badge badge-primary">Followers: {{ followers }}</span>
          <span class="badge badge-info">Views: {{ views }}</span>
          <span class="badge badge-success">Uptime: {{ uptime }}</span>
        </div>

        <ul class="navbar-nav ml-auto">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Manage
            </a>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
              <router-link to="/commands" class="nav-link nav-link2">Commans</router-link>
              <router-link to="/keywords" class="nav-link nav-link2">Keywords</router-link>
              <router-link to="/variables" class="nav-link nav-link2">Variables</router-link>
              <router-link to="/timers" class="nav-link nav-link2">Timers</router-link>
              <router-link to="/overlays" class="nav-link nav-link2">Overlays</router-link>
            </div>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Settings
            </a>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
            <router-link to="/settings/moderation" class="nav-link nav-link2">Moderation</router-link>
            <router-link to="/settings/users" class="nav-link nav-link2">Users</router-link>
            <router-link to="/settings/notable" class="nav-link nav-link2">Notableplayers</router-link>
            </div>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Integrations
            </a>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
              <router-link to="/integrations/donationalerts" class="nav-link nav-link2">Donationalerts</router-link>
              <router-link to="/integrations/streamlabs" class="nav-link nav-link2">StreamLabs</router-link>
              <router-link to="/integrations/qiwi" class="nav-link nav-link2">Qiwi</router-link>
              <router-link to="/integrations/spotify" class="nav-link nav-link2">Spotify</router-link>
            </div>
          </li>
          </li>
        </ul>
      </nav>

      <router-view class="body container"></router-view>
      </div>
  `,
  methods: {
    getStreamData: async function () {
      setTimeout(() => this.getStreamData(), 10 * 1000)
      this.$socket.emit('stream.data', null, async (err, data) => {
        if (err) return console.log(err)
        if (data.uptime) {
          const diff = moment(moment().format()).diff(data.uptime)
          this.uptime = humanizeDuration(moment.duration(diff), { language: data.lang })
        } else this.uptime = 'offline'

        this.viewers = data.viewers
        this.subscribers = data.subscribers
        this.views = data.views
        this.title = data.status
        this.game = data.game
        this.followers = data.followers
        this.channel = data.channel
      })
    }
  },
  mounted () {
    this.getStreamData()
  }
}).$mount('#app')
