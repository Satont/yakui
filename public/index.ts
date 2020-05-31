import Vue from 'vue'
import VueRouter from 'vue-router'
import VueClipboard from 'vue-clipboard2'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './css/main.css'

function lazyLoad(path){
  return() => import(`./vue/${path}`)
}

Vue.use(VueRouter)
Vue.use(VueClipboard)
Vue.use(BootstrapVue)
Vue.component('side-bar', lazyLoad('components/sidebar.vue'))
Vue.component('nav-bar', lazyLoad('components/navbar.vue'))

const router = new VueRouter({
  routes: [
    { path: '/', component: lazyLoad('index.vue'), alias: '/home' }
  ],
})

new Vue({
  router,
  template: `
  <div>
  <side-bar></side-bar>
  <nav-bar></nav-bar>
  <router-view class="main"></router-view>
  </div>
  `
}).$mount('#app')
