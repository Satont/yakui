<template>
  <div>
    <b-form @submit.prevent="save">
      <b-button class="btn-block mt-1" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" variant="success" v-if="settings.enabled" @click="settings.enabled = !settings.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!settings.enabled" @click="settings.enabled = !settings.enabled">Disabled</b-button>

      <label for="textarea" class="mt-2">Ignored users</label>
      <b-form-textarea  id="textarea" v-model="settings.ignoredUsers" placeholder="1 line = 1 user" rows="3" max-rows="8"></b-form-textarea>

      <label for="textarea" class="mt-2">Bot admins</label>
      <b-form-textarea  id="textarea" v-model="settings.botAdmins" placeholder="1 line = 1 user" rows="3" max-rows="8"></b-form-textarea>

      <h4 class="text-ceter mt-2">Points</h4>
      <b-button class="btn-block" variant="success" v-if="settings.points.enabled" @click="settings.points.enabled = !settings.points.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!settings.points.enabled" @click="settings.points.enabled = !settings.points.enabled">Disabled</b-button>

      <b-input-group size="sm" class="mt-1" prepend="Points messages interval">
        <b-form-input type="text" v-model="settings.points.messages.interval"></b-form-input>
      </b-input-group>
      <b-input-group size="sm" class="mt-1" prepend="Amount of points for message interval">
        <b-form-input type="text" v-model="settings.points.messages.amount"></b-form-input>
      </b-input-group>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'

@Component
export default class General extends Vue {
  settings = {
    space: 'users',
    enabled: true,
    ignoredUsers: '',
    botAdmins: '',
    points: {
      enabled: false,
      messages: {
        interval: 1,
        amount: 1,
      },
      watch: {
        interval: 1,
        amount: 1,
      }
    }
  }

  async save() {
    const space = this.settings.space
    const data = Object.entries(this.settings)
      .filter(v => v[0] !== 'space')
      .map((item) => ({ space, name: item[0], value: item[1] }))

    await this.$axios.post('/settings', [
      { space: this.settings.space, name: 'enabled', value: this.settings.enabled },
      { space: this.settings.space, name: 'points', value: this.settings.points },
      { space: this.settings.space, name: 'ignoredUsers', value: this.settings.ignoredUsers.split('\n').filter(Boolean).map(u => u.toLowerCase()) },
      { space: this.settings.space, name: 'botAdmins', value: this.settings.botAdmins.split('\n').filter(Boolean).map(u => u.toLowerCase()) }
    ])
  }

  async created() {
    const { data } = await this.$axios.get('/settings?space=' + this.settings.space)

    this.settings.enabled = data.find(item => item.name === 'enabled')?.value ?? true
    this.settings.ignoredUsers = data.find(item => item.name === 'ignoredUsers')?.value?.join('\n') ?? ''
    this.settings.botAdmins = data.find(item => item.name === 'botAdmins')?.value?.join('\n') ?? ''
    if (data.find(item => item.name === 'points')?.value) {
      this.settings.points = data.find(item => item.name === 'points').value
    }
  }
}
</script>
