import Vue from 'vue'
import VueRouter from 'vue-router'
import VueClipboard from 'vue-clipboard2'
import Axios from './vue/plugins/axios'
import VueSocketIO from 'vue-socket.io-extended'
import Socket from './vue/plugins/socket'
import humanizeDuration from 'humanize-duration'
import BootstrapVue from 'bootstrap-vue'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './css/main.css'

import isLogged from './helpers/isLogged'

Vue.use(VueRouter)
Vue.use(VueClipboard)
Vue.use(BootstrapVue)
Vue.use(Toast)
Vue.use(Axios)
Vue.use(VueSocketIO, Socket)
Vue.component('loading', () => import('./vue/components/loadingAnimation.vue'))
Vue.component('side-bar', () => import('./vue/components/sidebar.vue'))
Vue.component('nav-bar', () => import('./vue/components/navbar.vue'))
Vue.component('variables-list', () => import('./vue/components/variablesList.vue'))

const start = async () => {
  const user = await isLogged(true, true)

  const router = new VueRouter({
    mode: 'history',
    routes: [
      { path: '/', name: 'Home', component: () => import('./vue/pages/dashboard/index.vue'), alias: '/home' },
      {
        path: '/settings',
        component: () => import('./vue/pages/settings/index.vue'),
        children: [
          { path: '', name: 'General', component: () => import('./vue/pages/settings/general.vue') },
          { path: 'oauth', name: 'OAuth', component: () => import('./vue/pages/settings/oauth.vue') },
          { path: 'moderation', name: 'Moderation', component: () => import('./vue/pages/settings/moderation.vue') },
          { path: 'users', name: 'Users', component: () => import('./vue/pages/settings/users.vue') },
        ]
      },
      { path: '/events', name: 'EventsManager', component: () => import('./vue/pages/events/index.vue') },
      {
        path: '/integrations',
        component: () => import('./vue/pages/integrations/index.vue'),
        children: [
          { path: '', alias: 'donationalerts', name: 'DonationAlerts', component: () => import('./vue/pages/integrations/donationalerts.vue') },
          { path: 'spotify', name: 'Spotify', component: () => import('./vue/pages/integrations/spotify.vue') },
          { path: 'qiwi', name: 'Qiwi', component: () => import('./vue/pages/integrations/qiwi.vue') },
          { path: 'satontapi', name: 'Satont api', component: () => import('./vue/pages/integrations/satontapi.vue') },
        ]
      },

      { path: '/commands', name: 'CommandsManagerList', component: () => import('./vue/pages/commands/list.vue') },
      { path: '/commands/edit/:id?', name: 'CommandsManagerEdit', component: () => import('./vue/pages/commands/edit.vue') },

      { path: '/timers', name: 'TimersManagerList', component: () => import('./vue/pages/timers/list.vue') },
      { path: '/timers/edit/:id?', name: 'TimersManagerEdit', component: () => import('./vue/pages/timers/edit.vue') },

      { path: '/keywords', name: 'KeywordsManagerList', component: () => import('./vue/pages/keywords/list.vue') },
      { path: '/keywords/edit/:id?', name: 'KeywordsManagerEdit', component: () => import('./vue/pages/keywords/edit.vue') },

      { path: '/users', name: 'UsersManagerList', component: () => import('./vue/pages/users/list.vue') },
      { path: '/users/edit/:id?', name: 'UsersManagerEdit', component: () => import('./vue/pages/users/edit.vue') },

      { path: '/variables', name: 'CustomVariablesManagerList', component: () => import('./vue/pages/variables/list.vue') },
      { path: '/variables/edit/:id?', name: 'CustomVariablesManagerEdit', component: () => import('./vue/pages/variables/edit.vue') },

      { path: '/greetings', name: 'GreetingsManagerList', component: () => import('./vue/pages/greetings/list.vue') },
      { path: '/greetings/edit/:id?', name: 'GreetingsManagerEdit', component: () => import('./vue/pages/greetings/edit.vue') },

      { path: '/markers', name: 'MarkersList', component: () => import('./vue/pages/markers/list.vue') },

      { path: '/overlays', name: 'OverlaysManagerList', component: () => import('./vue/pages/overlays/list.vue') },
      { path: '/overlays/edit/:id?', name: 'OverlaysManagerEdit', component: () => import('./vue/pages/overlays/edit.vue') },
    ],
  })

  const app = new Vue({
    data: {
      loading: false,
      loggedUser: user,
      metadata: {
        stream: {
          viewers: 0,
          startedAt: null
        },
        channel: {
          views: 0,
          game: 'No data',
          title: 'No data',
          name: null,
        },
        uptime: 'offline',
      },
      updateTimeout: null,
      lang: 'RU',
      title: 'Bot Panel'
    },
    router,
    template: `
    <div>
      <nav-bar></nav-bar>
      <div class="container-fluid">
        <side-bar></side-bar>
        <loading v-if="$root.loading"></loading>
        <router-view v-if="!$root.loading" class="col-md-11 ml-sm-auto col-lg-11 px-md-4 pt-md-3"></router-view>
      </div>
    </div>
    `,
    async mounted() {
      await this.fetchMetadata()
    },
    methods: {
      async fetchMetadata() {
        clearTimeout(this.updateTimeout)
        this.updateTimeout = setTimeout(() => this.fetchMetadata(), 10000);

        const { data } = await this.$axios.get('/metaData')

        this.title = data.bot?.username?.toUpperCase() ?? this.title
        document.title = this.title
        this.metadata.stream = data.stream
        this.metadata.channel = data.channel
        this.metadata.mainCurrency = data.mainCurrency
        this.metadata.lang = data.lang

        this.updateUptime()
      },
      updateUptime() {
        if (!this.metadata.stream.startedAt) this.metadata.uptime = 'offline';
        else {
          this.metadata.uptime = humanizeDuration(Date.now() - new Date(this.metadata.stream.startedAt).getTime(), { units: ['mo', 'd', 'h', 'm', 's'], round: true })
        }
      }
    },
    beforeDestroy() {
      clearTimeout(this.updateTimeout)
    }
  }).$mount('#app')

  router.beforeEach((to, from, next) => {
    app.loading = true
    next()
  })

  router.afterEach((to, from) => {
    app.loading = false
  })

}

start()
