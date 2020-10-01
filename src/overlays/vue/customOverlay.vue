<template>
  <div v-if="overlay" v-html="overlay.data"></div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Overlay } from '@bot/entities/Overlay'
import axios from 'axios'

@Component
export default class CustomOverlay extends Vue {
  overlay: Overlay = null

  async created() {
    const overlay = await axios.get('/api/v1/overlays/' + this.$route.params.id)

    this.overlay = overlay.data

    this.createCss()
    this.createJs()
    this.fetchData()
  }

  createCss() {
    if (!this.overlay.css) return

    const head = document.getElementsByTagName('head')[0]
    const style = document.createElement('style')

    style.type = 'text/css'

    style.appendChild(document.createTextNode(this.overlay.css))

    head.appendChild(style)
  }

  createJs() {
    if (!this.overlay.js) return

    for (const item of this.overlay.js) {
      const script = document.createElement('script')
      script.setAttribute('src', item)
      document.head.appendChild(script)
    }
  }

  async fetchData() {
    setTimeout(() => this.fetchData(), 5 * 1000)

    const data = await axios.get('/api/v1/overlays/parse/' + this.$route.params.id, {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      }
    })

    this.overlay.data = data.data
  }
}
</script>
