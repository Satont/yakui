import Vue from 'vue'
import router from './router/index'
import App from './App.vue'

import { BootstrapVue } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import './assets/css/sanitize.css'
import './assets/css/main.css'
import './assets/css/fonts.css'

Vue.use(BootstrapVue)

Vue.config.productionTip = false

new Vue({
  render: (h) => h(App),
  router,
}).$mount('#wrapper')
