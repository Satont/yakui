<template>
  <b-card title="Title" no-body header-tag="header" footer-tag="footer" class="my-bg-dark mt-3">
    <template v-slot:header>
      <div class="widget-header">
        <div class="name-widget"><IconChat />Chat</div>
        <div class="options-widget">
          <span style="color: #A9A9A9; padding-right: 2px">Chatters:</span>
          783
        </div>
      </div>
    </template>
    <iframe
      frameborder="0"
      scrolling="no"
      id="chat_embed"
      width="100%"
      style="height: 720px"
      src="https://www.twitch.tv/embed/nykan/chat?parent=localhost&darkpopout"
    ></iframe>
    <template v-slot:footer>
      <div style="display: flex">
        <input type="text" placeholder="Send your message" class="footer-input-widget" />
        <button type="submit" class="widget-btn btn-chat">Send</button>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import IconChat from '../assets/icons/Chat.svg'

@Component({
  name: 'Chat',
  components: {
    IconChat
  },
})
export default class Chat extends Vue {}
</script>

<style scoped>
.btn-chat {
  width: 71px;
  height: 32px;
  margin-left: 9px;
}
</style>