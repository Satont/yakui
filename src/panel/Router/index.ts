import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: { template: '<div></div>' }, // this is needed, because we mount dashboard directly in App.vue
    },
    {
      path: '/events',
      component: () => import('../Pages/Events.vue'),
    },
  ],
})
