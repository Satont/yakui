import Vue from 'vue'
import VueRouter from 'vue-router'

import Commands from './vue/commands/list.vue'
import createCommand from './vue/commands/create.vue'
import editCommand from './vue/commands/edit.vue'

import keywords from './vue/keywords/list.vue'
import createKeyword from './vue/keywords/create.vue'
import editKeyword from './vue/keywords/edit.vue'

import Variables from './vue/variables/list.vue'
import createVariable from './vue/variables/create.vue'
import editVariable from './vue/variables/edit.vue'

import timers from './vue/timers/list.vue'
import createTimer from './vue/timers/create.vue'
import editTimer from './vue/timers/edit.vue'

import moderation from './vue/settings/moderation.vue'
import variablelist from './vue/single/variables.vue'

import SocketIO from 'socket.io-client';
import VueSocketIO from 'vue-socket.io'
import cooldownModal from './vue/components/cooldownmodal.vue'
import settingsUsers from './vue/settings/users.vue'
import notable from './vue/settings/notable.vue'

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

  { path: '/keywords', component: keywords },
  { path: '/keywords/create', component: createKeyword },
  { path: '/keywords/edit/:name', name: 'editKeyword', component: editKeyword },

  { path: '/variables', component: Variables },
  { path: '/variables/create', component: createVariable },
  { path: '/variables/edit/:name', name: 'editVariable', component: editVariable },

  { path: '/timers', component: timers },
  { path: '/timers/create', component: createTimer },
  { path: '/timers/edit/:name', name: 'editTimer', component: editTimer },

  { path: '/settings/moderation', component: moderation },
  { path: '/settings/users', component: settingsUsers },
  { path: '/settings/notable', component: notable },

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
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Manage
            </a>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
              <router-link to="/commands" class="nav-link nav-link2">Commans</router-link>
              <router-link to="/keywords" class="nav-link nav-link2">Keywords</router-link>
              <router-link to="/variables" class="nav-link nav-link2">Variables</router-link>
              <router-link to="/timers" class="nav-link nav-link2">Timers</router-link>
            </div>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Settings
            </a>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
            <router-link to="/settings/moderation" class="nav-link nav-link2">Moderation</router-link>
            <router-link to="/settings/users" class="nav-link nav-link2">Users</router-link>
            <router-link to="/settings/notable" class="nav-link nav-link2">Notableplayers</router-link>
            </div>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Integrations
            </a>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
              <router-link to="/integrations/donationalerts" class="nav-link nav-link2">Donationalerts</router-link>
              <router-link to="/integrations/streamlabs" class="nav-link nav-link2">StreamLabs</router-link>
              <router-link to="/integrations/qiwi" class="nav-link nav-link2">Qiwi</router-link>
            </div>
          </li>
          </li>
        </ul>
      </nav>

      <router-view class="body container"></router-view>
      </div>
  `
}).$mount('#app')