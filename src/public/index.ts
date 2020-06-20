import Vue from 'vue'
import VueRouter from 'vue-router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '../panel/css/main.css'
import isLogged from '../panel/helpers/isLogged'

Vue.use(VueRouter)
Vue.use(BootstrapVue)
Vue.component('loading', () => import('./vue/components/loadingAnimation.vue'))
Vue.component('nav-bar', () => import('./vue/components/navbar.vue'))
Vue.component('side-bar', () => import('./vue/components/sidebar.vue'))

const start = async () => {
  const user = await isLogged(false)

  const router = new VueRouter({
    routes: [
      { path: '/', name: 'Home', component: () => import('./vue/index.vue'), alias: '/home' },
      { path: '/commands', name: 'Commands', component: () => import('./vue/pages/commands/index.vue') },
    ],
  })

  const app = new Vue({
    data: {
      loading: false,
      loggedUser: user,
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
}

start()
