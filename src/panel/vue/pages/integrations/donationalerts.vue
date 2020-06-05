<template>
  <div>
    <b-form @submit.prevent="save">
      <b-button class="btn-block" variant="success" v-if="settings.enabled" @click="settings.enabled = !settings.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!settings.enabled" @click="settings.enabled = !settings.enabled">Disabled</b-button>

      <b-form-group label="Access token" label-for="lang" class="mt-3">
        <b-form-input id="access_token" v-model="settings.access_token" type="password" placeholder="DonationAlerts access_token"></b-form-input>
      </b-form-group>

      <b-button class="btn-block mb-2" type="submit" href="https://bot.satont.ru/en/integrations/" target="_blank" variant="success">Generate token</b-button>
      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'

@Component
export default class General extends Vue {
  settings = {
    space: 'donationalerts',
    access_token: '',
    enabled: false
  }

  async created() {
    const { data } = await axios.get('/api/v1/settings?space=' + this.settings.space)

    for (const item of data) {
      this.settings[item.name] = item.value
    }
  }

  async save() {
    const space = this.settings.space
    const data = Object.entries(this.settings)
      .filter(v => v[0] !== 'space')
      .map((item) => ({ space, name: item[0], value: item[1] }))

    await axios.post('/api/v1/settings', data)
  }
}
</script>