<template>
  <div>
    <b-navbar toggleable="lg" type="light" variant="dark" sticky class="flex-md-nowrap p-0 shadow">
      <b-navbar-brand class="navbar-brand col-md-1 col-lg-1 mr-0 px-3" router-link to="/">{{ $store.state.metaData.bot.username || 'Yakui' | truncate  }}</b-navbar-brand>

      <b-nav align='center'>
        <b-nav-item>Viewers: {{ $store.state.metaData.stream.viewers || 0}}</b-nav-item>
        <b-nav-item>Views: {{ $store.state.metaData.channel.views || 0}}</b-nav-item>
        <b-nav-item>Title: {{ $store.state.metaData.channel.title || '' }}</b-nav-item>
        <b-nav-item>Game: {{ $store.state.metaData.channel.game || 'game' }}</b-nav-item>
        <b-nav-item>Uptime: {{ $store.state.metaData.stream.startedAt || 'offline' }}</b-nav-item>
      </b-nav>

      <div class="ml-auto ml-2 mr-2">
        <b-dropdown v-if="$store.state.loggedUser" right no-caret variant="dark" class="text-white" size="sm">
          <template v-slot:button-content>
            <b-img :src="$store.state.loggedUser.profile_image_url" style="width: 30px;border-radius: 30px;"></b-img>
            {{ $store.state.loggedUser.display_name }}
          </template>
          <b-dropdown-text class="dd-content">
           <div><b>{{ $store.state.loggedUser.points || 0 }}</b> <span class="text-muted">points</span></div>
            <div><b>{{ $store.state.loggedUser.messages || 0 }}</b> <span class="text-muted">messages</span></div>
            <div><b>{{ $store.state.loggedUser.watched || 0 }}</b> <span class="text-muted">watched</span></div>
            <div><b>{{ tipsFormatted }}</b> <span class="text-muted">donated</span></div>
            <div><b>{{ $store.state.loggedUser.bits || 0 }}</b> <span class="text-muted">bits donated</span></div>
            <b-button-group size="sm" style="width: 100%;">
              <b-btn variant="success" href="/public">Public</b-btn>
              <b-btn @click="logout" variant="danger">Sign Out</b-btn>
            </b-button-group>
          </b-dropdown-text>
        </b-dropdown>
        <b-btn v-else size="sm" href="/login">Login</b-btn>
      </div>

  </b-navbar>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  filters: {
    truncate(text: string) {
      return text.length > 11 ? text.substring(0, 8) + '...' : text
    }
  }
})
export default class NavBar extends Vue {
  get tipsFormatted() {
    if (!this.$store.state.loggedUser.tips) return 0

    const result = new Intl.NumberFormat(this.getLocale(), {
      currencyDisplay: 'symbol',
      style: 'currency',
      currency: this.$store.state.metaData.mainCurrency
      }).format(Number(this.$store.state.loggedUser.tips))

    return result.replace(/\s/, '')
  }

  logout() {
    localStorage.setItem('code', '')
    localStorage.setItem('accessToken', '')
    localStorage.setItem('refreshToken', '')
    localStorage.setItem('userType', '')
    window.location.replace(window.location.origin + '/public')
  }

  getLocale() {
    return (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language
  }
}
</script>

<style scoped>
.shadow {
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
.navbar-brand {
  padding-top: .75rem;
  padding-bottom: .75rem;
  font-size: 1rem;
  background-color: rgba(0, 0, 0, .25);
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, .25);
  color: #fff;
  text-align: center;
}

.navbar-light .navbar-brand:hover, .navbar-light .navbar-brand:focus {
  color: #fff;
}

.nav > li > .nav-link, .nav-link:hover, .nav-link:focus {
  cursor: default !important;
  color: #fff;
}

.nav > .nav-link {
  white-space: nowrap;
  color: #fff !important;
}

.nav-justified .nav-item {
  flex-basis: unset !important;
}

.navbar .navbar-toggler {
  top: .25rem;
  right: 1rem;
}

.navbar-light .navbar-text {
  color: #fff;
}

.navbar .form-control {
  padding: .75rem 1rem;
  border-width: 0;
  border-radius: 0;
}

.dd-content {
  justify-content: center;
  display: flex;
  flex-direction: column;
  width: 200px;
  font-size: 15px;
}
</style>
