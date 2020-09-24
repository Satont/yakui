<template>
  <b-card title="Title" no-body header-tag="header" footer-tag="footer" class="my-bg-dark mt-3">
    <template v-slot:header>
      <div class="widget-header">
        <div class="name-widget"><IconChat />Chat</div>
        <div class="options-widget">
          <span style="color: #A9A9A9; padding-right: 2px">Chatters:</span>
          {{ data.chatters }}
        </div>
      </div>
    </template>
    <iframe
      frameborder="0"
      scrolling="no"
      id="chat_embed"
      width="100%"
      style="height: 720px"
      :src="chatUrl"
    ></iframe>
    <template v-slot:footer>
      <div style="display: flex">
        <input type="text" v-model="message" placeholder="Send your message" class="footer-input-widget" />
        <button type="submit" @click="sendMessage()" class="widget-btn btn-chat">Send</button>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { getNameSpace } from '@panel/vue/plugins/socket'
import { Vue, Component } from 'vue-property-decorator'
import IconChat from '../assets/icons/Chat.svg'

@Component({
  name: 'Chat',
  components: {
    IconChat
  },
})
export default class Chat extends Vue {
  interval = null
  socket = getNameSpace({ name: 'widgets/chat' })
  data = {
    chatters: 0
  }
  message = null

  get chatUrl() {
    const channel = this.$store.state.metaData.channel.name

    return `https://www.twitch.tv/embed/${channel}/chat?parent=${window.location.origin}&darkpopout`
  }

  created() {
    this.refreshData()
    setInterval(() => this.refreshData(), 1 * 60 * 1000)
  }

  refreshData() {
    this.socket.emit('getData', data => this.data = data)
  }

  beforeDestroy() {
    clearInterval(this.interval)
  }

  sendMessage() {
    this.socket.emit('sendMessage', this.message)
    this.message = null
  }
}
</script>

<style scoped>
.btn-chat {
  width: 71px;
  height: 32px;
  margin-left: 9px;
}
</style>