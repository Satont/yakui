<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <b-form-group label="Command name" label-for="name">
        <b-form-input id="name" v-model="command.name" type="text" required placeholder="Enter command name"></b-form-input>
      </b-form-group>

       <b-form-group label="Command aliases">
         <b-input-group size="sm" v-for="(aliase, index) in command.aliases" :key="index" class="mb-1">
            <b-form-input v-model="command.aliases[index]" type="text" placeholder="Command aliase"></b-form-input>
            <b-input-group-append><b-button size="sm" variant="danger" @click.prevent="delAliase(index)">Delete</b-button></b-input-group-append>
         </b-input-group>
         <b-button class="mt-1" block size="sm" type="success" variant="success" @click.prevent="createAliase">+</b-button>
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

      <b-form-group label="Command description" label-for="description">
        <b-form-input id="description" v-model="command.description" type="text" placeholder="Enter command description"></b-form-input>
      </b-form-group>

      <b-form-group label="Command visibility" label-for="visibility">
        <b-btn v-bind:class="{ 'btn-success': command.visible, 'btn-danger': !command.visible }" v-on:click="command.visible = !command.visible">
          <span v-show="command.visible">Visible</span>
          <span v-show="!command.visible">Not visible</span>
        </b-btn>
      </b-form-group>

      <b-button class="btn-block mb-5" variant="success" v-if="command.enabled" @click.prevent="command.enabled = !command.enabled">Enabled</b-button>
      <b-button class="btn-block mb-5" variant="warning" v-if="command.enabled" @click.prevent="command.enabled = !command.enabled">Disabled</b-button>

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
    response: null,
    cooldown: 10,
    visible: true,
    permission: 'viewers',
    description: null,
    aliases: [],
    enabled: true,
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
    this.filterAliases()

    await axios.post('/api/v1/commands', this.command)
    await this.$router.push({ name: 'CommandManagerList' })
  }

  filterAliases() {
    this.command.aliases = this.command.aliases.filter(o => o !== '' && o)
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

  createAliase() {
    this.command.aliases.push(null);
  }

  delAliase(index) {
    this.command.aliases.splice(index, 1);
  }
}
</script>