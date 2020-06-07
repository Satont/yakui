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
  mode: 'history',
  routes: [
    { path: '/', name: 'Home', component: () => import('./vue/index.vue'), alias: '/home' },
    { path: '/settings', name: 'SettingsManager', component: () => import('./vue/pages/settings/index.vue') },
    { path: '/events', name: 'EventsManager', component: () => import('./vue/pages/events/index.vue') },
    { path: '/integrations', name: 'IntegrationsManager', component: () => import('./vue/pages/integrations/index.vue') },

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
  ],
})

new Vue({
  router,
  template: `
  <div>
    <nav-bar></nav-bar>
    <div class="container-fluid">
      <side-bar></side-bar>
      <router-view class="col-md-11 ml-sm-auto col-lg-11 px-md-4 pt-md-3"></router-view>
    </div>
  </div>
  `
}).$mount('#app')
