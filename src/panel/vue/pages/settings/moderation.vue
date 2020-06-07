<template>
  <div>
    <b-form @submit.prevent="save">
      <b-button class="btn-block" variant="success" v-if="settings.enabled" @click="settings.enabled = !settings.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!settings.enabled" @click="settings.enabled = !settings.enabled">Disabled</b-button>
  
      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>

      <div class="row cards mt-3">

        <div class="col-md-6">
          <div class="card bg-dark">
            <div class="card-header">Links</div>
            <div class="card-body">
              <div class="btn-group btn-group-sm d-flex mb-3">
                <b-btn size="sm" class="w-100" v-bind:class="{ 'btn-success': settings.links.enabled, 'btn-danger': !settings.links.enabled }" @click="settings.links.enabled = !settings.links.enabled">
                  <span v-show="settings.links.enabled">Enabled</span>
                  <span v-show="!settings.links.enabled">Disabled</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.links.subscribers, 'btn-danger': !settings.links.subscribers }" @click="settings.links.subscribers = !settings.links.subscribers">
                  <span>Moderate subscribers</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.links.vips, 'btn-danger': !settings.links.vips }" @click="settings.links.vips = !settings.links.vips">
                  <span>Moderate vips</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.links.clips, 'btn-danger': !settings.links.clips }" @click="settings.links.clips = !settings.links.clips">
                  <span>Moderate Clips</span>
                </b-btn>
              </div>

              <b-input-group size="sm" prepend="Timeout time" append="message">
                <b-form-input type="number" v-model.number="settings.links.timeout.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.links.timeout.message"></b-form-input>
              </b-input-group>

              <b-input-group size="sm" class="mt-1" prepend="Warning time" append="message">
                <b-form-input type="number" v-model.number="settings.links.warning.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.links.warning.message"></b-form-input>
              </b-input-group>

            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-dark">
            <div class="card-header">Symbols</div>
            <div class="card-body">
              <div class="btn-group btn-group-sm d-flex mb-3">
                <b-btn size="sm" class="w-100" v-bind:class="{ 'btn-success': settings.symbols.enabled, 'btn-danger': !settings.symbols.enabled }" @click="settings.symbols.enabled = !settings.symbols.enabled">
                  <span v-show="settings.symbols.enabled">Enabled</span>
                  <span v-show="!settings.symbols.enabled">Disabled</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.symbols.subscribers, 'btn-danger': !settings.symbols.subscribers }" @click="settings.symbols.subscribers = !settings.symbols.subscribers">
                  <span>Moderate subscribers</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.symbols.vips, 'btn-danger': !settings.symbols.vips }" @click="settings.symbols.vips = !settings.symbols.vips">
                  <span>Moderate vips</span>
                </b-btn>
              </div>

              <b-input-group size="sm" prepend="Trigger length" append="max percentage">
                <b-form-input type="number" v-model.number="settings.symbols.trigger['length']"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.symbols.trigger.percent"></b-form-input>
              </b-input-group>

              <b-input-group size="sm" class="mt-1" prepend="Timeout time" append="message">
                <b-form-input type="number" v-model.number="settings.symbols.timeout.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.symbols.timeout.message"></b-form-input>
              </b-input-group>

              <b-input-group size="sm" class="mt-1" prepend="Warning time" append="message">
                <b-form-input type="number" v-model.number="settings.symbols.warning.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.symbols.warning.message"></b-form-input>
              </b-input-group>

            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-dark">
            <div class="card-header">Long message</div>
            <div class="card-body">
              <div class="btn-group btn-group-sm d-flex mb-3">
                <b-btn size="sm" class="w-100" v-bind:class="{ 'btn-success': settings.longMessage.enabled, 'btn-danger': !settings.longMessage.enabled }" @click="settings.longMessage.enabled = !settings.longMessage.enabled">
                  <span v-show="settings.longMessage.enabled">Enabled</span>
                  <span v-show="!settings.longMessage.enabled">Disabled</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.longMessage.subscribers, 'btn-danger': !settings.longMessage.subscribers }" @click="settings.longMessage.subscribers = !settings.longMessage.subscribers">
                  <span>Moderate subscribers</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.longMessage.vips, 'btn-danger': !settings.longMessage.vips }" @click="settings.longMessage.vips = !settings.longMessage.vips">
                  <span>Moderate vips</span>
                </b-btn>
              </div>

              <b-input-group size="sm" prepend="Trigger length" >
                <b-form-input type="number" v-model.number="settings.longMessage.trigger['length']"></b-form-input>
              </b-input-group>

              <b-input-group size="sm" class="mt-1" prepend="Timeout time" append="message">
                <b-form-input type="number" v-model.number="settings.longMessage.timeout.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.longMessage.timeout.message"></b-form-input>
              </b-input-group>

              <b-input-group size="sm" class="mt-1" prepend="Warning time" append="message">
                <b-form-input type="number" v-model.number="settings.longMessage.warning.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.longMessage.warning.message"></b-form-input>
              </b-input-group>

            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-dark">
            <div class="card-header">Caps</div>
            <div class="card-body">
              <div class="btn-group btn-group-sm d-flex mb-3">
                <b-btn size="sm" class="w-100" v-bind:class="{ 'btn-success': settings.caps.enabled, 'btn-danger': !settings.caps.enabled }" @click="settings.caps.enabled = !settings.caps.enabled">
                  <span v-show="settings.caps.enabled">Enabled</span>
                  <span v-show="!settings.caps.enabled">Disabled</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.caps.subscribers, 'btn-danger': !settings.caps.subscribers }" @click="settings.caps.subscribers = !settings.caps.subscribers">
                  <span>Moderate subscribers</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.caps.vips, 'btn-danger': !settings.caps.vips }" @click="settings.caps.vips = !settings.caps.vips">
                  <span>Moderate vips</span>
                </b-btn>
              </div>

              <b-input-group size="sm" prepend="Trigger length" append="max percentage">
                <b-form-input type="number" v-model.number="settings.caps.trigger['length']"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.caps.trigger.percent"></b-form-input>
              </b-input-group>

              <b-input-group size="sm" class="mt-1" prepend="Timeout time" append="message">
                <b-form-input type="number" v-model.number="settings.caps.timeout.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.caps.timeout.message"></b-form-input>
              </b-input-group>

              <b-input-group size="sm" class="mt-1" prepend="Warning time" append="message">
                <b-form-input type="number" v-model.number="settings.caps.warning.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.caps.warning.message"></b-form-input>
              </b-input-group>

            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-dark">
            <div class="card-header">Color</div>
            <div class="card-body">
              <div class="btn-group btn-group-sm d-flex mb-3">
                <b-btn size="sm" class="w-100" v-bind:class="{ 'btn-success': settings.color.enabled, 'btn-danger': !settings.color.enabled }" @click="settings.color.enabled = !settings.color.enabled">
                  <span v-show="settings.color.enabled">Enabled</span>
                  <span v-show="!settings.color.enabled">Disabled</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.color.subscribers, 'btn-danger': !settings.color.subscribers }" @click="settings.color.subscribers = !settings.color.subscribers">
                  <span>Moderate subscribers</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.color.vips, 'btn-danger': !settings.color.vips }" @click="settings.color.vips = !settings.color.vips">
                  <span>Moderate vips</span>
                </b-btn>
              </div>

              <b-input-group size="sm" class="mt-1" prepend="Timeout time" append="message">
                <b-form-input type="number" v-model.number="settings.color.timeout.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.color.timeout.message"></b-form-input>
              </b-input-group>

              <b-input-group size="sm" class="mt-1" prepend="Warning time" append="message">
                <b-form-input type="number" v-model.number="settings.color.warning.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.color.warning.message"></b-form-input>
              </b-input-group>

            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card bg-dark">
            <div class="card-header">Emotes</div>
            <div class="card-body">
              <div class="btn-group btn-group-sm d-flex mb-3">
                <b-btn size="sm" class="w-100" v-bind:class="{ 'btn-success': settings.emotes.enabled, 'btn-danger': !settings.emotes.enabled }" @click="settings.emotes.enabled = !settings.emotes.enabled">
                  <span v-show="settings.emotes.enabled">Enabled</span>
                  <span v-show="!settings.emotes.enabled">Disabled</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.emotes.subscribers, 'btn-danger': !settings.emotes.subscribers }" @click="settings.emotes.subscribers = !settings.emotes.subscribers">
                  <span>Moderate subscribers</span>
                </b-btn>
                <b-btn class="w-100" v-bind:class="{ 'btn-success': settings.emotes.vips, 'btn-danger': !settings.emotes.vips }" @click="settings.emotes.vips = !settings.emotes.vips">
                  <span>Moderate vips</span>
                </b-btn>
              </div>


              <b-input-group size="sm" prepend="Trigger length" >
                <b-form-input type="number" v-model.number="settings.emotes.trigger['length']"></b-form-input>
              </b-input-group>

              <b-input-group size="sm" class="mt-1" prepend="Timeout time" append="message">
                <b-form-input type="number" v-model.number="settings.emotes.timeout.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.emotes.timeout.message"></b-form-input>
              </b-input-group>

              <b-input-group size="sm" class="mt-1" prepend="Warning time" append="message">
                <b-form-input type="number" v-model.number="settings.emotes.warning.time"></b-form-input>
                <b-form-input type="text" v-model.trim="settings.emotes.warning.message"></b-form-input>
              </b-input-group>

            </div>
          </div>
        </div>

      </div>
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
export default class ModerationSettings extends Vue {
  settings = {
    space: 'moderation',
    enabled: false,
    links: {
      enabled: false,
      vips: false,
      subscribers: false,
      timeout: {
        time: 600,
        message: 'links disallowed'
      },
      warning: {
        time: 10,
        message: 'links disallowed [warn]'
      },
      clips: false,
    },
    symbols: {
      enabled: false,
      vips: false,
      subscribers: false,
      timeout: {
        time: 600,
        message: 'to much symbols'
      },
      warning: {
        time: 10,
        message: 'to much symbols [warn]'
      },
      trigger: {
        length: 15,
        percent: 50
      },
    },
    longMessage: {
      enabled: false,
      vips: false,
      subscribers: false,
      timeout: {
        time: 600,
        message: 'so long message'
      },
      warning: {
        time: 10,
        message: 'so long message [warn]'
      },
      trigger: {
        length: 300,
      },
    },
    caps: {
      enabled: false,
      vips: false,
      subscribers: false,
      timeout: {
        time: 600,
        message: 'to much caps'
      },
      warning: {
        time: 10,
        message: 'to much caps [warn]'
      },
      trigger: {
        length: 15,
        percent: 50
      },
    },
    color: {
      enabled: false,
      vips: false,
      subscribers: false,
      timeout: {
        time: 600,
        message: '/me disallowed'
      },
      warning: {
        time: 10,
        message: '/me disallowed [warn]'
      },
    },
    emotes: {
      enabled: false,
      vips: false,
      subscribers: false,
      timeout: {
        time: 600,
        message: '/me disallowed'
      },
      warning: {
        time: 10,
        message: '/me disallowed [warn]'
      },
      trigger: {
        length: 10
      }
    },
  }
}
</script>

<style scoped>
.cards > div > div.card {
  height: calc(100% - 15px);
  margin-bottom: 15px;
}
.card-span {
  display: block !important;
  white-space: normal !important;
}
.card-body > div.btn-group {
  margin-bottom: 5px;
}
</style>