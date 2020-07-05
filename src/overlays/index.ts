import Vue from 'vue'
import Router from 'vue-router'

Vue.component('loading', () => import('../panel/vue/components/loadingAnimation.vue'))
Vue.use(Router)


const router = new Router({
  mode: 'history',
  base: '/overlay',
  routes: [
    { path: '/', component: () => import('./vue/customOverlay.vue') },
    { path: '/custom/:id', name: 'CustomOverlay', component: () => import('./vue/customOverlay.vue') }
  ]
})

const app = new Vue({
  data: {
    loading: false,
  },
  router,
  template: `
  <div>
    <loading v-if="$root.loading"></loading>
    <router-view v-if="!$root.loading"></router-view>
  </div>
  `,
}).$mount('#app')

router.beforeEach((to, from, next) => {
  app.loading = true
  next()
})

router.afterEach((to, from) => {
  app.loading = false
})

