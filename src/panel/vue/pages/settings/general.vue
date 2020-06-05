<template>
  <div>
    <b-form @submit.prevent="save">
      <b-form-group label="Lang" label-for="lang">
        <b-form-select id="lang" v-model="settings.locale" :options="['ru', 'en']" size="sm"></b-form-select>
      </b-form-group>

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
    space: 'general',
    locale: 'ru'
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