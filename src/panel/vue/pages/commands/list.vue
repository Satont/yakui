<template>
  <div>
    <h1>Command list</h1>
    <p class="pb-2" v-if="!isPublic()">
      <b-button class="btn-block" variant="primary" size="sm" @click="edit">New command</b-button>
    </p>

    <b-table striped hover borderless dark :items="commands" :fields="fields">
      <template v-slot:cell(response)="data">
        <span v-html="data.value"></span>
      </template>

      <template v-slot:cell(used)="data">
        {{ data.value }} times
      </template>

      <template v-slot:cell(actions)="row">
         <b-button-group size="sm">
          <b-button @click="row.toggleDetails">{{ row.detailsShowing ? 'Hide' : 'Show' }} Details</b-button>
          <b-button variant="primary" v-if="$root.loggedUser.userType === 'admin' && row.item.type === 'custom' && !isPublic()" @click="edit(row.item)">Edit</b-button>
          <b-button variant="danger" v-if="$root.loggedUser.userType === 'admin' && row.item.type === 'custom' && !isPublic()" @click="del(row.item)">Delete</b-button>
        </b-button-group>
      </template>

      <template v-slot:row-details="row">
        <b-card bg-variant="dark" text-variant="white">
          <b-row v-if="row.item.aliases && row.item.aliases.length"><b-col sm="3"><b>Aliases:</b> {{ row.item.aliases.join(', ') }}</b-col></b-row>
          <b-row v-if="row.item.description"><b-col sm="3"><b>Description:</b> {{ row.item.description }}</b-col></b-row>
          <b-row><b-col sm="3"><b>Cooldown:</b> {{ row.item.cooldown || 0 }}</b-col></b-row>
          <b-row><b-col sm="3"><b>Price:</b> {{ row.item.price || 0 }}</b-col></b-row>
        </b-card>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { Command } from 'typings'
import { EnvChecker } from '../helpers/mixins'

@Component
export default class CommandsManagerList extends EnvChecker {
  commands: Command[] = []
  fields = [
    { key: 'name', label: 'Name' },
    { key: 'response', label: 'Response' },
    'permission',
    { key: 'used', label: 'Used' },
    { key: 'actions' },
  ]

  async created() {
    const commands = await this.$axios.get('/commands')
    this.commands = commands.data
    const variables = await this.$axios.get('/variables/all')
    this.commands = this.commands
      .filter(c => this.isPublic() ? c.enabled && c.visible : true)
      .map(c => {
        let response = c.response || c.description || ''

        for (const variable of variables.data) {
          response = response
            .replace(variable.name, `<span class="variable">${variable.response}</span>`)
        }

        if (response.includes('(eval')) {
          response = '<span class="variable">(eval)</span>'
        }

        return { ...c, response }
      })
  }

  async edit(params) {
    await this.$router.push({ name: 'CommandsManagerEdit', params })
  }

  async del(command: Command) {
    const index = this.commands.indexOf(command)
    await this.$axios.delete('/commands', {
      data: { id: command.id }
    })
    this.commands.splice(index, 1)
    this.$toast.success('Success')
  }
}
</script>

<style>
.variable {
  background: #16a085;
  padding: 3px;
  border-radius: 2px;
}
</style>
