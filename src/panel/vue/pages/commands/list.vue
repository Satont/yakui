<template>
  <div>
    <h1>Command list</h1>
    <p class="pb-2">
      <b-button class="btn-block" variant="primary" size="sm" @click="edit">New command</b-button>
    </p>
    <div class="row cards">
      <div class="col-md-6" :key="index" v-for="(command, index) in commands">
        <b-card text-variant="dark" header-class="p-2" body-class="p-2" footer-class="p-2 footer">
          <template v-slot:header>
            !{{ command.name }} {{ (command.aliases && command.aliases.length) ? '(' + command.aliases.join(', ') + ')' : '' }}
          </template>
          <b-card-text>{{ command.response }} </b-card-text>
          <template v-slot:footer>
          <p class="m-0">
            <b-button class="btn" disabled variant="dark" size="sm">Cooldown <b-badge variant="light">{{ command.cooldown || 'off' }}</b-badge></b-button>
            <b-button class="btn" disabled variant="dark" size="sm">Permission <b-badge variant="light">{{ command.permission }}</b-badge></b-button>
          </p>
          <p class="m-0">
            <b-button class="btn" variant="primary" size="sm" @click="edit(command)">Edit</b-button>
            <b-button class="btn" variant="danger" size="sm" @click="del(command.id, index)">Delete</b-button>
          </p>
          </template>
        </b-card>
      </div>
    </div>
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

  async created() {
    const { data } = await axios.get('/api/v1/commands')
    this.commands = data
  }

  async edit(params) {
    await this.$router.push({ name: 'CommandsManagerEdit', params })
  }

  async del(id, index) {
    await axios.delete('/api/v1/commands', { data: { id } })
    this.commands.splice(index, 1)
  }
}
</script>

<style scoped>
.btn {
  opacity: 1 !important;
}
.footer {
  display: flex; justify-content: space-between;
}
.cards > div > div.card {
  height: calc(100% - 15px);
  margin-bottom: 15px;
  padding-right: 0px !important; 
  padding-left: 0px !important;
}
.card-span {
  display: block !important;
  white-space: normal !important;
}
.card-body > div.btn-group {
  margin-bottom: 5px;
}
</style>