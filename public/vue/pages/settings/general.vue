<template>
  <div>
    <b-form @submit.prevent="save">
      <b-form-group label="Channel" label-for="channel">
        <b-form-input size="sm" id="channel" v-model="settings.channel" type="text" required placeholder="Enter channel name"></b-form-input>
      </b-form-group>

      <b-form-group label="Bot">
        <b-form-input size="sm" v-model="settings.botAccessToken" type="text" placeholder="Enter bot access_token"></b-form-input>
        <b-form-input size="sm" class="mt-1" v-model="settings.botRefreshToken" type="text" placeholder="Enter bot refresh_token"></b-form-input>
        <b-btn class="mt-1" block size="sm" variant="info" href="https://bot.satont.ru/helpers/" target="_blank">Generate tokens</b-btn>
      </b-form-group>

       <b-form-group label="Broadcaster">
        <b-form-input size="sm" v-model="settings.broadcasterAccessToken" type="text"  placeholder="Enter broadcaster access_token"></b-form-input>
        <b-form-input size="sm" class="mt-1" v-model="settings.broadcasterRefreshToken" type="text" placeholder="Enter broadcaster refresh_token"></b-form-input>
        <b-btn class="mt-1" block size="sm" variant="info" href="https://bot.satont.ru/helpers/" target="_blank">Generate tokens</b-btn>
      </b-form-group>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'

@Component
export default class GeneralSettings extends Vue {
  settings = {
    space: 'oauth',
    botAccessToken: '',
    botRefreshToken: '',
    broadcasterAccessToken: '',
    broadcasterRefreshToken: '',
  }

  async save() {
    const space = this.settings.space
    const data = Object.entries(this.settings)
      .filter(v => v[0] !== 'space')
      .map((item) => ({ space, name: item[0], value: item[1] }))

    await axios.post('/api/v1/settings', data)
  }

  async created() {
    const { data } = await axios.get('/api/v1/settings?space=' + this.settings.space)
    for (const item of data) {
      this.settings[item.name] = item.value
    }
  }
}
</script>