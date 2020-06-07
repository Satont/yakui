<template>
  <div>
    <b-form @submit.prevent="save">
      <div class="row cards mt-3">
        <div class="col-md-6">
          <div class="card bg-dark">
            <div class="card-header">Songs</div>
            <div class="card-body">
              <b-btn size="sm" class="w-100" v-bind:class="{ 'btn-success': settings.songs.enabled, 'btn-danger': !settings.songs.enabled }" @click="settings.songs.enabled = !settings.songs.enabled">
                  <span v-show="settings.songs.enabled">Enabled</span>
                  <span v-show="!settings.songs.enabled">Disabled</span>
              </b-btn>

              <b-input-group size="sm" prepend="Vk id" class="mt-2">
                <b-form-input v-model.trim="settings.songs.vk"></b-form-input>
              </b-input-group>
              <b-input-group size="sm" prepend="Last fm nickname" class="mt-2">
                <b-form-input v-model.trim="settings.songs.lastfm"></b-form-input>
              </b-input-group>
              <b-input-group size="sm" prepend="Twitch dj id" class="mt-2">
                <b-form-input v-model.trim="settings.songs.twitchjd"></b-form-input>
              </b-input-group>
            </div>
          </div>
        </div>
         <div class="col-md-6">
          <div class="card bg-dark">
            <div class="card-header">Faceit</div>
            <div class="card-body">
              <b-btn size="sm" class="w-100" v-bind:class="{ 'btn-success': settings.faceit.enabled, 'btn-danger': !settings.faceit.enabled }" @click="settings.faceit.enabled = !settings.faceit.enabled">
                  <span v-show="settings.faceit.enabled">Enabled</span>
                  <span v-show="!settings.faceit.enabled">Disabled</span>
              </b-btn>

              <b-input-group size="sm" prepend="Faceit nickname" class="mt-2">
                <b-form-input v-model.trim="settings.faceit.nickname"></b-form-input>
              </b-input-group>
            </div>
          </div>
        </div>
      </div>
      <b-button class="btn-block mt-3" type="submit" variant="primary">Save</b-button>
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
export default class SatontApi extends Vue {
  settings = {
    space: 'satontapi',
    faceit: {
      enabled: false,
      nickname: null,
    },
    songs: {
      enabled: false,
      vk: null,
      lastfm: null,
      twitchdj: null,
    }
  }
}
</script>