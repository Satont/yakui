import Vue from 'vue';
import VueRouter from 'vue-router';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import '../panel/css/main.css';
import isLogged from '../panel/helpers/isLogged';
import Axios from '../panel/vue/plugins/axios';
import { store } from '../panel/vue/plugins/vuex';
import { getNameSpace } from '../panel/vue/plugins/socket';

Vue.use(VueRouter);
Vue.use(BootstrapVue);
Vue.use(Axios);
Vue.component('loading', () => import('./vue/components/loadingAnimation.vue'));
Vue.component('nav-bar', () => import('../panel/vue/components/navbar.vue'));
Vue.component('side-bar', () => import('./vue/components/sidebar.vue'));

const start = async () => {
  const user = await isLogged(false, false);
  store.commit('setLoggedUser', user);

  const metaDataSocket = getNameSpace({ name: 'systems/metaData', opts: { query: { isPublic: true } } });
  await new Promise((res) => metaDataSocket.emit('getData', data => {
    store.commit('setMetaData', data);
    document.title = data.bot?.username?.toUpperCase();
    res(null);
  }));

  const router = new VueRouter({
    routes: [
      { path: '/', name: 'Home', component: () => import('./vue/index.vue'), alias: '/home' },
      { path: '/commands', name: 'Commands', component: () => import('../panel/vue/pages/commands/list.vue') },
      { path: '/quotes', name: 'Quotes', component: () => import('../panel/vue/pages/quotes/list.vue') },
      { path: '/users', name: 'users', component: () => import('../panel/vue/pages/users/list.vue') },
    ],
  });

  const app = new Vue({
    data: {
      loading: false,
    },
    router,
    store,
    template: `
    <div>
      <nav-bar></nav-bar>
      <div class="container-fluid">
        <side-bar></side-bar>
        <loading v-if="$root.loading"></loading>
        <router-view v-if="!$root.loading" class="col-md-11 ml-sm-auto col-lg-11 px-md-4 pt-md-3"></router-view>
      </div>
    </div>
    `,
    async mounted() {
      metaDataSocket.on('data', data => {
        store.commit('setMetaData', data);
        document.title = data.bot?.username?.toUpperCase();
      });
    },
  }).$mount('#app');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  router.beforeEach((to, from, next) => {
    app.loading = true;
    next();
  });

  router.afterEach(() => {
    app.loading = false;
  });
};

start();
