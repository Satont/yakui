<template>
  <div>
    <b-form @submit.prevent="save">
      <b-button class="btn-block" variant="success" v-if="settings.enabled" @click="settings.enabled = !settings.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!settings.enabled" @click="settings.enabled = !settings.enabled">Disabled</b-button>

      <b-button class="btn-block mt-1" type="submit" variant="primary">Save</b-button>
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
export default class General extends Vue {
  settings = {
    space: 'users',
    enabled: true
  }
}
</script>