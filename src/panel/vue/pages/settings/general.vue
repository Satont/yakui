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
import { Settings } from './mixins'

@Component({
  mixins: [Settings]
})
export default class General extends Vue {
  settings = {
    space: 'general',
    locale: 'ru'
  }
}
</script>