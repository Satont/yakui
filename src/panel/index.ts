import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'
import VueClipboard from 'vue-clipboard2'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './css/main.css'

Vue.use(VueRouter)
Vue.use(VueClipboard)
Vue.use(BootstrapVue)
Vue.component('loading', () => import('./vue/components/loadingAnimation.vue'))
Vue.component('side-bar', () => import('./vue/components/sidebar.vue'))
Vue.component('nav-bar', () => import('./vue/components/navbar.vue'))

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', name: 'Home', component: () => import('./vue/index.vue'), alias: '/home' },
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
  ],
})

const app = new Vue({
  data: {
    loading: false,
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
  `
}).$mount('#app')

router.beforeEach((to, from, next) => {
  app.loading = true
	next()
})

router.afterEach((to, from) => {
  app.loading = false
})