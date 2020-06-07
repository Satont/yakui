<template>
  <div>
    <b-form @submit.prevent="save">
      <b-form-group label="Channel" label-for="channel">
        <b-form-input size="sm" id="channel" v-model="settings.channel" type="text" required placeholder="Enter channel name"></b-form-input>
      </b-form-group>

      <b-form-group label="Bot">
        <b-form-input size="sm" v-model="settings.botAccessToken" type="password" placeholder="Enter bot access_token"></b-form-input>
        <b-form-input size="sm" class="mt-1" v-model="settings.botRefreshToken" type="password" placeholder="Enter bot refresh_token"></b-form-input>
        <b-btn class="mt-1" block size="sm" variant="info" href="https://bot.satont.ru/helpers/" target="_blank">Generate tokens</b-btn>
      </b-form-group>

       <b-form-group label="Broadcaster">
        <b-form-input size="sm" v-model="settings.broadcasterAccessToken" type="password" placeholder="Enter broadcaster access_token"></b-form-input>
        <b-form-input size="sm" class="mt-1" v-model="settings.broadcasterRefreshToken" type="password" placeholder="Enter broadcaster refresh_token"></b-form-input>
        <b-btn class="mt-1" block size="sm" variant="info" href="https://bot.satont.ru/helpers/" target="_blank">Generate tokens</b-btn>
      </b-form-group>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'
import { Settings } from '../helpers/mixins'

@Component({
  mixins: [Settings]
})
export default class Oauth extends Vue {
  settings = {
    space: 'oauth',
    botAccessToken: '',
    botRefreshToken: '',
    broadcasterAccessToken: '',
    broadcasterRefreshToken: '',
  }
}
</script>