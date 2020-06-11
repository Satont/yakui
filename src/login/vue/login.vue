<template>
  <b-container class="center p-5 text-center">
    <b-btn variant="success" class="mt-3" @click="login">Login</b-btn>
  </b-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data: () => ({
    popoutUrl: null
  }),
  methods: {
    login() {
      const btoa = window.btoa(JSON.stringify({ popoutUrl: this.popoutUrl, url: this.url, referrer: document.referrer }))
      window.location.replace('http://oauth.satont.ru/?state=' + encodeURIComponent(btoa))
    }
  },
  mounted() {
    const hash = window.location.hash
    if (hash.trim().length > 0) {
      const error = hash.match(/error=[a-zA-Z0-9+]*/)
      if (error) {
        this.error = error[0].split('=')[1];
      }
      const url = hash.match(/url=[a-zA-Z0-9+:\?\/#]*/)
      if (url) {
        this.popoutUrl = url[0].split('=')[1];
      }
    } else {
      // autorefresh
      this.login();
    }
  }
})
</script>
