<template>
  <Interface :title="title">
    <iframe frameborder="0"
        scrolling="no"
        id="chat_embed"
        width="100%"
        style="height: calc(100% - 40px)"
        :src="src">
    </iframe>
  </Interface>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Interface from './_interface.vue'

@Component({
  extends: Interface
})
export default class Chat extends Vue {
  title = 'Chat'
  src = `https://www.twitch.tv/embed/${(this.$root as any).title.toLowerCase()}/chat?parent=${window.location.origin}`
}
</script>
