<template>
  <iframe frameborder="0"
    scrolling="no"
    id="chat_embed"
    width="100%"
    style="height: calc(100% - 40px)"
    :src="src">
  </iframe>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  props: {
    id: Number
  }
})
export default class Chat extends Vue {
  title = 'Chat'

  get src() {
    return `https://player.twitch.tv/?channel${(this.$root as any).title.toLowerCase()}&parent=${window.location.hostname}&autoplay=true&muted=true`
      + '&darkpopout'
  }
}
</script>
