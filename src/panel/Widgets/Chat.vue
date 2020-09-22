<template>
  <b-card title="Title" no-body header-tag="header" footer-tag="footer" class="my-bg-dark mt-3">
    <template v-slot:header>
      <div class="chat-header">
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
import IconChat from '../../assets/icons/Chat.svg'

@Component({
  name: 'Chat',
  components: {
    IconChat
  },
})
export default class Chat extends Vue {}
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-chat {
  width: 71px;
  height: 32px;
  margin-left: 9px;
}

.my-footer {
  display: flex;
  height: 47px;
  align-items: center;
  padding: 15px;
}
.footer-input-widget {
  border: none;
  display: flex;
  align-items: center;
  width: 480px;
  height: 32px;
  background: #0d0d0d;
  border-radius: 4px;
  color: #fff;
  padding-left: 8px;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
}

.name-widget,
.options-widget {
  display: flex;
  align-items: center;
  padding-right: 10px;
  font-weight: bold;
  font-size: 16px;
}

.options-widget {
  font-weight: bold;
  font-size: 12px;
  color: #fff;
}

.name-widget > svg {
  margin-right: 10px;
}

.button-widget {
  width: 143px;
  height: 40px;
}

.footer_site-btn-widget {
  margin-left: auto;
  margin-right: 24px;
}

.widget-btn {
  border: none;
  background-color: #6c43b5;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
</style>