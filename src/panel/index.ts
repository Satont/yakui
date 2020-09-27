import Vue from 'vue'
import router from './Router/index'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io-extended'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import './Helpers/vueFilters'
import Axios from './Plugins/axios'
import Store from './Plugins/vuex'
import isLogged from './Helpers/isLogged'
import translate from './Helpers/translate'
import Socket from './Plugins/socket'
import { BootstrapVue } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import './assets/css/sanitize.css'
import './assets/css/main.css'
import './assets/css/fonts.css'
import getMetadata from './Helpers/getMetadata'

Vue.use(Axios)
Vue.use(BootstrapVue)
Vue.use(VueSocketIO, Socket)

Vue.config.productionTip = false
Vue.prototype.$dayjs = dayjs
Vue.prototype.translate = translate

const start = async() => {
  const user = await isLogged(true, true)
  Store.commit('setLoggedUser', user)
  console.log(user)
  
  const metaData = await getMetadata()
  console.log(metaData)
  Store.commit('setMetaData', metaData)
  
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
