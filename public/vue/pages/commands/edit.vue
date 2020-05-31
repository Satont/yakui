<template>
  <div>
    <b-form v-on:sumbit="onSumbit">
      <b-form-group label="Command name" label-for="name">
        <b-form-input id="name" v-model="command.name" type="text" required placeholder="Enter command name"></b-form-input>
      </b-form-group>

      <b-form-group label="Command cooldown" label-for="cooldown">
        <b-form-input id="cooldown" v-model="command.cooldown" type="number" placeholder="Enter command cooldown"></b-form-input>
      </b-form-group>

      <b-form-group label="Command response" label-for="response">
        <b-form-input id="response" v-model="command.response" type="text" placeholder="Enter command response"></b-form-input>
      </b-form-group>

      <b-form-group label="Command visibility" label-for="visibility">
        <b-btn v-bind:class="{ 'btn-success': command.visible, 'btn-danger': !command.visible }" v-on:click="command.visible = !command.visible">
          <span v-show="command.visible">Visible</span>
          <span v-show="!command.visible">Not visible</span>
        </b-btn>
      </b-form-group>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { Command } from '../../../../src/typings'
import axios from 'axios'

@Component
export default class Edit extends Vue {
  command: Command = {
    name: '',
    response: '',
    cooldown: 10,
    visible: true,
  }

  async onSumbit() {
    await axios.post('/api/v1/commands', this.command)
    this.$router.push({ name: 'CommandManagerList' })
  }

  async onReset() {

  }
  async created() {
    const id = this.$route.params.id as any

    if (id) {
      this.command = this.$route.params as any

      const { data } = await axios.get('/api/v1/commands/' + id)

      this.command = data
    } else {
      this.$router.push({ name: 'commands' })
    }
  }
}
</script>