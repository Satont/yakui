<template>
  <b-card title="Title" no-body header-tag="header" footer-tag="footer" class="my-bg-dark mt-3">
    <template v-slot:header>
      <div class="chat-header">
        <div class="name-widget"><TwitchIcon />Stream</div>
      </div>
    </template>
    <b-card-body class="p-0 stream-widget">Пустой виджет</b-card-body>
  </b-card>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator'
import TwitchIcon from '../assets/icons/Twitch.svg'

@Component({
  name: 'Stream',
  components: {
   TwitchIcon
  },
})
export default class Stream extends Vue {}
</script>

<style scoped>
.stream-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.card-list {
  overflow: auto;
}
</style>
