import Vue from 'vue'
import VueRouter from 'vue-router'
import VueClipboard from 'vue-clipboard2'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './css/main.css'

Vue.use(VueRouter)
Vue.use(VueClipboard)
Vue.use(BootstrapVue)
Vue.component('side-bar', () => import('./vue/components/sidebar.vue'))
Vue.component('nav-bar', () => import('./vue/components/navbar.vue'))

const router = new VueRouter({
  routes: [
    { path: '/', component: () => import('./vue/index.vue'), alias: '/home' },
    { path: '/settings', component: () => import('./vue/pages/settings/index.vue') },

    { path: '/commands', name: 'CommandsManagerList', component: () => import('./vue/pages/commands/list.vue') },
    { path: '/commands/edit/:id?', name: 'CommandsManagerEdit', component: () => import('./vue/pages/commands/edit.vue') },

    { path: '/timers', name: 'TimersManagerList', component: () => import('./vue/pages/timers/list.vue') },
    { path: '/timers/edit/:id?', name: 'TimersManagerEdit', component: () => import('./vue/pages/timers/edit.vue') },

    { path: '/users', name: 'UsersManagerList', component: () => import('./vue/pages/users/list.vue') },
    { path: '/users/edit/:id?', name: 'UsersManagerEdit', component: () => import('./vue/pages/users/edit.vue') },
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
