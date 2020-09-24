import Vue from 'vue'
import router from './Router/index'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io-extended'

import './Helpers/vueFilters'
import Axios from './Plugins/axios'
import Store from './Plugins/vuex'
import isLogged from './Helpers/isLogged'
//import Socket from './Plugins/socket'
import { BootstrapVue } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import './assets/css/sanitize.css'
import './assets/css/main.css'
import './assets/css/fonts.css'

Vue.use(Axios)
Vue.use(BootstrapVue)
//Vue.use(VueSocketIO, Socket)

Vue.config.productionTip = false

const start = async() => {
  const user = await isLogged(true, true)
  Store.commit('setLoggedUser', user)
  console.log(user)
  
  const app = new Vue({
    data: () => ({
      loading: false,
    }),
    render: (h) => h(App),
    router,
    store: Store,
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
