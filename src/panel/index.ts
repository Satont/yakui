import Vue from 'vue'
import router from './Router/index'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io-extended'
import LoadScript from 'vue-plugin-load-script'
import Socket, { getNameSpace } from './vue/plugins/socket'
import BootstrapVue from 'bootstrap-vue'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import translate from './Helpers/translate'
import './Helpers/vueFilters'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import './assets/css/sanitize.css'
import './assets/css/main.css'
import './assets/css/fonts.css'
//import getMetadata from './Helpers/getMetadata'
import VueRouter from 'vue-router'
import VueClipboard from 'vue-clipboard2'
import isLogged from './Helpers/isLogged'
import Store from './Plugins/vuex'
import Axios from './Plugins/axios'

Vue.config.productionTip = false
Vue.prototype.$dayjs = dayjs
Vue.prototype.translate = translate

Vue.use(VueRouter)
Vue.use(VueClipboard)
Vue.use(BootstrapVue)
Vue.use(Toast)
Vue.use(LoadScript)
Vue.component('loading', () => import('./vue/components/loadingAnimation.vue'))
Vue.component('side-bar', () => import('./vue/components/sidebar.vue'))
Vue.component('nav-bar', () => import('./vue/components/navbar.vue'))
Vue.component('variables-list', () => import('./vue/components/variablesList.vue'))
Vue.component('dashboard', () => import('./vue/pages/dashboard/index.vue'))

const start = async () => {
  const user = await isLogged(true, true)
  Store.commit('setLoggedUser', user)

  Vue.use(VueSocketIO, Socket)
  Vue.use(Axios)

  const metaDataSocket = getNameSpace({ name: 'systems/metaData' })
  await new Promise((res) => metaDataSocket.emit('getData', data => {
    Store.commit('setMetaData', data)
    document.title = data.bot?.username?.toUpperCase()
    res()
  }))

  const filesSocket = getNameSpace({ name: 'systems/files' })
  filesSocket.emit('getAll', (_err, files) => Store.commit('setFilesList', files))

  /* const router = new VueRouter({
    mode: 'history',
    routes: [
      { path: '/', name: 'Home', component: { template: `<div></div>` }, alias: '/home' },
      {
        path: '/settings',
        component: () => import('./vue/pages/settings/index.vue'),
        children: [
          { path: '', name: 'General', component: () => import('./vue/pages/settings/general.vue') },
          { path: 'oauth', name: 'OAuth', component: () => import('./vue/pages/settings/oauth.vue') },
          { path: 'moderation', name: 'Moderation', component: () => import('./vue/pages/settings/moderation.vue') },
          { path: 'users', name: 'Users', component: () => import('./vue/pages/settings/users.vue') },
          { path: 'tts', name: 'TTS', component: () => import('./vue/pages/settings/tts.vue') },
        ],
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
        ],
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

      { path: '/overlays', name: 'OverlaysManagerList', component: () => import('./vue/pages/overlays/list.vue') },
      { path: '/overlays/edit/:id?', name: 'OverlaysManagerEdit', component: () => import('./vue/pages/overlays/edit.vue') },
      { path: '/files', name: 'Files', component: () => import('./vue/pages/files/index.vue') },
    ],
  }) */

  const app = new Vue({
    data: () => ({
      loading: false,
    }),
    render: (h) => h(App),
    router,
    store: Store,
    async created() {
      const code = this.$store.state.metaData.lang.lang.code
      await import(`dayjs/locale/${code}`)
      this.$dayjs.locale(code)
    },
  }).$mount('#wrapper')

  router.beforeEach((to, from, next) => {
    app.loading = true
    next()
  })

  router.afterEach(() => {
    app.loading = false
  })
}

start()
