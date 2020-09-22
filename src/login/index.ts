import Vue from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '../panel/css/main.css'

new Vue({
  data: () => ({
    popoutUrl: null,
  }),
  template: `
    <b-container class="center p-5 text-center">
      <b-btn variant="success" class="mt-3" @click="login">Login</b-btn>
    </b-container>
  `,
  methods: {
    login() {
      const btoa = window.btoa(JSON.stringify({ popoutUrl: this.popoutUrl, url: this.url, referrer: document.referrer }))
      window.location.replace('http://oauth.satont.ru/?state=' + encodeURIComponent(btoa))
    },
  },
  mounted() {
    const hash = window.location.hash
    if (hash.trim().length > 0) {
      const error = hash.match(/error=[a-zA-Z0-9+]*/)
      if (error) {
        window.location.replace('/public')
      }
      // eslint-disable-next-line no-useless-escape
      const url = hash.match(/url=[a-zA-Z0-9+:\?\/#]*/)
      if (url) {
        this.popoutUrl = url[0].split('=')[1]
      }
    } else {
      this.login()
    }
  },
  computed: {
    url: () => (window.location.origin),
  },
}).$mount('#app')
