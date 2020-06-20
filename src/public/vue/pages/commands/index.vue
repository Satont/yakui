<template>
  <div>
    <h1>Command list</h1>
    <b-table striped hover borderless dark :items="commands" :fields="fields">
      <template v-slot:cell(response)="data">
        <span v-html="data.value"></span>
      </template>

      <template v-slot:cell(actions)="row">
        <b-button size="sm" @click="row.toggleDetails">
          {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
        </b-button>
      </template>

      <template v-slot:row-details="row">
        <b-card bg-variant="dark" text-variant="white">
          <b-row><b-col sm="3"><b>Aliases:</b> {{ row.item.aliases.join(', ') }}</b-col></b-row>
          <b-row><b-col sm="3"><b>Description:</b> {{ row.item.description }}</b-col></b-row>
          <b-row><b-col sm="3"><b>Cooldown:</b> {{ row.item.cooldown }}</b-col></b-row>
          <b-row><b-col sm="3"><b>Price:</b> {{ row.item.price }}</b-col></b-row>
        </b-card>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { Command } from 'typings'
import axios from 'axios'

@Component
export default class CommandsManagerList extends Vue {
  commands: Command[] = []
  fields = [
    { key: 'name', label: 'Name' },
    { key: 'response', label: 'Response' },
    'permission',
    { key: 'actions' },
  ]

  async created() {
    const { data } = await axios.get('/api/v1/commands')
    const variables = await axios.get('/api/v1/variables/all')
    this.commands = data
      .filter(c => c.enabled && c.visible)
      .map(c => {
        let response = c.response

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
}
</script>

<style>
.variable {
  background: #16a085;
  padding: 3px;
  border-radius: 2px;
}
</style>
