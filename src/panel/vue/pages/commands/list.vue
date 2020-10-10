<template>
  <div>
    <h1>Command list</h1>
    <p class="pb-2" v-if="!isPublic()">
      <b-button class="btn-block" variant="primary" size="sm" @click="edit">New command</b-button>
    </p>

    <b-table striped hover borderless dark :items="commands" :fields="fields">
      <template v-slot:cell(decoratedResponse)="data">
        <span v-html="data.value"></span>
      </template>

      <template v-slot:cell(used)="data">
        {{ data.value }} times
      </template>

      <template v-slot:cell(actions)="row">
         <b-button-group size="sm">
          <b-button @click="row.toggleDetails">{{ row.detailsShowing ? 'Hide' : 'Show' }} Details</b-button>
          <b-button variant="primary" v-if="buttonShouldBeVissible(row.item.type)" @click="edit(row.item)">Edit</b-button>
          <b-button variant="danger" v-if="buttonShouldBeVissible(row.item.type)" @click="del(row.item)">Delete</b-button>
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
  variables = []
  commands: Command[] = []
  fields = [
    { key: 'name', label: 'Name' },
    { key: 'decoratedResponse', label: 'Response' },
    'permission',
    { key: 'usage', label: 'Used' },
    { key: 'actions' },
  ]

  async created() {
    const [commands, variables] = await Promise.all([
      this.$axios.get('/commands'),
      this.$axios.get('/variables/all')
    ])

    this.commands = commands.data
    this.variables = variables.data

    this.commands = this.commands
      .filter(c => this.isPublic() ? c.enabled && c.visible : true)
      .map(c => {
        let decoratedResponse = c.response || c.description || ''

        for (const variable of variables.data) {
          decoratedResponse = decoratedResponse
            .replace(variable.name, `<span class="variable">${variable.response}</span>`)
        }

        if (decoratedResponse.includes('(eval')) {
          decoratedResponse = '<span class="variable">(eval)</span>'
        }

        return { ...c, decoratedResponse }
      })
  }

  buttonShouldBeVissible(type) {
    return this.$store.state.loggedUser.userType === 'admin' && type === 'custom' && !this.isPublic()
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
