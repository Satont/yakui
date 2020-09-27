<template>
  <header class="header_site">
    <div class="header_site-information">
      <div class="information">
        {{ translate('ui.navbar.viewers') }}:
        <span class="information_value">{{ $store.state.metaData.stream.viewers }}</span>
      </div>
      <div class="information">
        Views:
        <span class="information_value">{{ $store.state.metaData.channel.views | formatNumbersWithSpaces }}</span>
      </div>
      <div class="information">
        Uptime:
        <span class="information_value">Currently Offline</span>
      </div>
      <div class="information">
        Category:
        <span class="information_value">{{ $store.state.metaData.channel.game }}</span>
      </div>
      <div class="information">
        Title:
        <span class="information_value">{{ $store.state.metaData.channel.title }}</span>
      </div>
    </div>
  </header>
</template>

<script lang='ts'>
import { getNameSpace } from '@panel/vue/plugins/socket'
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Header extends Vue {
  socket = getNameSpace({ name: 'systems/metaData' })
  interval = null

  created() {
    this.refreshData()
    setInterval(() => this.refreshData(), 5 * 1000)
  }

  refreshData() {
    this.socket.emit('getData', data => this.$store.commit('setMetaData', data))
  }

  beforeDestroy() {
    clearInterval(this.interval)
  }
}
</script>

<style scoped>
.header_site {
  display: flex;
  align-items: center;
  position: sticky;
  background-color: #121212;
  width: 100% !important;
  top: 0;
  right: 0;
  left: 0;
  z-index: 9998;
  padding-left: 64px;
  height: 47px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.header_site-information {
  display: flex;
  flex-wrap: wrap;
}

.information {
  padding-right: 16px;
  color: #a9a9a9;
  font-size: 12px;
  font-weight: bold;
}

.information_value {
  color: #fff;
}
</style>
