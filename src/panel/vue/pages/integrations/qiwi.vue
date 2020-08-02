<template>
  <div>
    <b-form @submit.prevent="save">
      <b-button class="btn-block" variant="success" v-if="settings.enabled" @click="settings.enabled = !settings.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!settings.enabled" @click="settings.enabled = !settings.enabled">Disabled</b-button>

      <b-form-group label="Token" label-for="token" class="mt-3">
        <b-form-input id="token" v-model.trim="settings.token" type="password" placeholder="Qiwi token"></b-form-input>
      </b-form-group>

      <b-button class="btn-block mb-2" type="submit" href="https://donate.qiwi.com/streamer/settings" target="_blank" variant="success">Get secret toket</b-button>
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
    space: 'qiwi',
    token: '',
    enabled: false
  }
}
</script>
