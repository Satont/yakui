<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <b-form-group label="Command name" label-for="name">
        <b-form-input id="name" v-model="command.name" type="text" required placeholder="Enter command name"></b-form-input>
      </b-form-group>

      <b-form-group label="Command cooldown" label-for="cooldown">
        <b-form-input id="cooldown" v-model="command.cooldown" type="number" placeholder="Enter command cooldown"></b-form-input>
      </b-form-group>

      <b-form-group label="Command permission" label-for="permission">
        <b-form-select v-model="command.permission" :options="avaliablePermissions" size="sm"></b-form-select>
      </b-form-group>

      <b-form-group label="Command response" label-for="response">
        <b-form-input id="response" v-model="command.response" type="text" required placeholder="Enter command response"></b-form-input>
      </b-form-group>

      <b-form-group label="Command visibility" label-for="visibility">
        <b-btn v-bind:class="{ 'btn-success': command.visible, 'btn-danger': !command.visible }" v-on:click="command.visible = !command.visible">
          <span v-show="command.visible">Visible</span>
          <span v-show="!command.visible">Not visible</span>
        </b-btn>
      </b-form-group>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="del" variant="danger" v-if="command.id">Delete</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { Command } from '../../../../src/typings'
import axios from 'axios'

@Component({})
export default class CommandManagerEdit extends Vue {
  command: Command = {
    name: '',
    response: '',
    cooldown: 10,
    visible: true,
    permission: 'viewers',
  }

  avaliablePermissions = [
    { value: 'viewers', text: 'Viewers' },
    { value: 'followers', text: 'Followers' },
    { value: 'vips', text: 'Vips' },
    { value: 'subscribers', text: 'Subscribers' },
    { value: 'moderators', text: 'Moderators' },
    { value: 'broadcaster', text: 'Broadcaster' },
  ]

  async onSubmit(event) {
    event.preventDefault()

    await axios.post('/api/v1/commands', this.command)
    await this.$router.push({ name: 'CommandManagerList' })
  }

  async created() {
    const id = this.$route.params.id as any

    if (id) {
      this.command = this.$route.params as any

      const { data } = await axios.get('/api/v1/commands/' + id)

      this.command = data
    }
  }

  async del() {
    await axios.delete('/api/v1/commands', { data: { id: this.command.id } })
  }
}
</script>