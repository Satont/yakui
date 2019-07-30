import Vue from 'vue'
import VueRouter from 'vue-router'

import Commands from './vue/commands/list.vue'
import createCommand from './vue/commands/create.vue'
import editCommand from './vue/commands/edit.vue'

import Variables from './vue/variables/list.vue'
import createVariable from './vue/variables/create.vue'
import editVariable from './vue/variables/edit.vue'

import timers from './vue/timers/list.vue'
import createTimer from './vue/timers/create.vue'
import editTimer from './vue/timers/edit.vue'

import moderation from './vue/single/moderation.vue'
import variablelist from './vue/single/variables.vue'

import SocketIO from 'socket.io-client';
import VueSocketIO from 'vue-socket.io'
import cooldownModal from './vue/components/cooldownmodal.vue'
import settingsUsers from './vue/settings/users.vue'

import donationalerts from './vue/integrations/donationalerts.vue'
import streamlabs from './vue/integrations/streamlabs.vue'
import qiwi from './vue/integrations/qiwi.vue'

Vue.use(new VueSocketIO({
  debug: true,
  connection: SocketIO('/')
}));
Vue.component('variables', variablelist)
Vue.use(VueRouter)
Vue.component('cooldownModal', cooldownModal)

const routes = [
  { path: '/', component: Commands },

  { path: '/commands', component: Commands },
  { path: '/commands/create', component: createCommand },
  { path: '/commands/edit/:name', name: 'editCommand', component: editCommand },

  { path: '/variables', component: Variables },
  { path: '/variables/create', component: createVariable },
  { path: '/variables/edit/:name', name: 'editVariable', component: editVariable },

  { path: '/timers', component: timers },
  { path: '/timers/create', component: createTimer },
  { path: '/timers/edit/:name', name: 'editTimer', component: editTimer },

  { path: '/settings/moderation', component: moderation },
  { path: '/settings/users', component: settingsUsers },

  { path: '/integrations/donationalerts', component: donationalerts },
  { path: '/integrations/streamlabs', component: streamlabs },
  { path: '/integrations/qiwi', component: qiwi },
]

const router = new VueRouter({
  routes 
})

new Vue({
  router,
  template: `
  <div>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <router-link to="/" class="navbar-brand mb-0 h1">Bot panel</router-link>
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <router-link to="/commands" class="nav-link">Commans</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/variables" class="nav-link">Variables</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/settings/moderation" class="nav-link">Moderation</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/timers" class="nav-link">Timers</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/settings/users" class="nav-link">Users</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/integrations/donationalerts" class="nav-link">Donationalerts</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/integrations/streamlabs" class="nav-link">StreamLabs</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/integrations/qiwi" class="nav-link">Qiwi</router-link>
          </li>
        </ul>
      </nav>

      <router-view class="body container"></router-view>
      </div>
  `
}).$mount('#app')