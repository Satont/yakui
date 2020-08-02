<template>
  <div>
    <b-form @submit.prevent="save">
      <b-button class="btn-block" variant="success" v-if="settings.enabled" @click="settings.enabled = !settings.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!settings.enabled" @click="settings.enabled = !settings.enabled">Disabled</b-button>

      <b-form-group label="Access token" label-for="lang" class="mt-3">
        <b-form-input id="access_token" v-model.trim="settings.access_token" type="password" placeholder="Spotify access_token"></b-form-input>
      </b-form-group>

       <b-form-group label="Refresh token" label-for="lang" class="mt-3">
        <b-form-input id="refresh_token" v-model.trim="settings.refresh_token" type="password" placeholder="Spotify access_token"></b-form-input>
      </b-form-group>

      <b-button class="btn-block mb-2" type="submit" href="https://bot.satont.ru/en/integrations/#Spotify" target="_blank" variant="success">Generate tokens</b-button>
      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Settings } from '../helpers/mixins'

@Component({
  mixins: [Settings]
})
export default class General extends Vue {
  settings = {
    space: 'spotify',
    access_token: '',
    refresh_token: '',
    enabled: true
  }
}
</script>
