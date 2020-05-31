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
    { path: '/', component: lazyLoad('index.vue'), alias: '/home' },
    { path: '/commands', name: 'CommandManagerList', component: lazyLoad('pages/commands/list.vue') },
    { path: '/commands/edit/:id?', name: 'CommandManagerEdit', component: lazyLoad('pages/commands/edit.vue') }
  ],
})

new Vue({
  router,
  template: `
  <div>
    <nav-bar></nav-bar>
    <div class="container-fluid">
      <side-bar></side-bar>
      <router-view class="col-md-9 ml-sm-auto col-lg-10 px-md-4 pt-md-3"></router-view>
    </div>
  </div>
  `
}).$mount('#app')
