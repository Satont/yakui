import Vue from 'vue';
import Router from 'vue-router';

Vue.prototype.$loadScript = function (src) {
  // eslint-disable-line no-param-reassign
  return new Promise(function (resolve, reject) {
    let shouldAppend = false;
    let el = document.querySelector('script[src="' + src + '"]');
    if (!el) {
      const newEl = document.createElement('script');
      newEl.type = 'text/javascript';
      newEl.async = true;
      newEl.src = src;
      el = newEl;
      shouldAppend = true;
    } else if (el.hasAttribute('data-loaded')) {
      resolve(el);
      return;
    }

    el.addEventListener('error', reject);
    el.addEventListener('abort', reject);
    el.addEventListener('load', function loadScriptHandler() {
      el.setAttribute('data-loaded', 'true');
      resolve(el);
    });

    if (shouldAppend) document.head.appendChild(el);
  });
};

Vue.prototype.$unloadScript = function (src) {
  // eslint-disable-line no-param-reassign
  return new Promise(function (resolve, reject) {
    const el = document.querySelector('script[src="' + src + '"]');

    if (!el) {
      reject();
      return;
    }

    document.head.removeChild(el);

    resolve(true);
  });
};

Vue.component('loading', () => import('../panel/vue/components/loadingAnimation.vue'));
Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: '/overlay',
  routes: [
    { path: '/', component: () => import('./vue/customOverlay.vue') },
    { path: '/custom/:id', name: 'CustomOverlay', component: () => import('./vue/customOverlay.vue') },
    { path: '/alerts', name: 'Alerts', component: () => import('./vue/alerts.vue') },
    { path: '/tts', name: 'TTS', component: () => import('./vue/tts.vue') },
  ],
});

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
}).$mount('#app');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.beforeEach((_to, _from, next) => {
  app.loading = true;
  next();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.afterEach((_to, _from) => {
  app.loading = false;
});
