<template>
  <div class="h-100">
    <iframe frameborder="0"
      scrolling="no"
      id="chat_embed"
      width="100%"
      style="height: calc(100% - 37px)"
      :src="src">
    </iframe>
     <b-form v-on:submit.prevent="sendMessage">
       <b-input-group size="sm">
        <b-form-input v-model.trim="message" placeholder="Send message as bot" />
        <b-input-group-append>
          <b-button size="sm" text="Button" type="submit" variant="success">Send</b-button>
        </b-input-group-append>
       </b-input-group>
     </b-form>
  </div>
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
  message = null

  get src() {
    return `https://www.twitch.tv/embed/${(this.$root as any).metadata.channel.name.toLowerCase()}/chat?parent=${window.location.hostname}`
      + '&darkpopout'
  }

  async sendMessage() {
    await this.$axios.post('/chatMessage/bot', { message: this.message })
    this.message = null
  }
}
</script>
