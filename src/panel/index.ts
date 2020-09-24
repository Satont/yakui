import Vue from 'vue'
import router from './Router/index'
import App from './App.vue'

import './Helpers/vueFilters'
import Axios from './Plugins/axios'
import Store from './Plugins/vuex'
import isLogged from './Helpers/isLogged'
import { BootstrapVue } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import './assets/css/sanitize.css'
import './assets/css/main.css'
import './assets/css/fonts.css'

Vue.use(Axios)
Vue.use(BootstrapVue)

Vue.config.productionTip = false

const start = async() => {
  const user = await isLogged(true, true)
  Store.commit('setLoggedUser', user)

  new Vue({
    render: (h) => h(App),
    router,
    store: Store,
  }).$mount('#wrapper')
}
start()
