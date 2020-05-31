<template>
  <div>
    <h1>Command list</h1>
    <p class="pb-2">
      <b-button class="btn-block" variant="primary" size="sm" @click="create">New command</b-button>
    </p>

    <b-card-group deck>
      <b-card v-for="command in commands" :key="command.id" :header="'!' + command.name" text-variant="dark" header-class="p-2" body-class="p-2" footer-class="p-2 footer">
        <template v-slot:header>
          {{ command.name }} {{ (command.aliases && command.aliases.length) ? '(' + command.aliases.join(', ') + ')' : '' }}
        </template>
        <b-card-text>{{ command.response }} </b-card-text>
        <template v-slot:footer>
         <p class="m-0">
           <b-button class="btn" disabled variant="dark" size="sm">Cooldown <b-badge variant="light">{{ command.cooldown || 'off' }}</b-badge></b-button>
         </p>
         <p class="m-0">
           <b-button class="btn" variant="primary" size="sm" @click="edit(command)">Edit</b-button>
         </p>
        </template>
      </b-card>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { Command } from '../../../../src/typings'
import axios from 'axios'

@Component
export default class Edit extends Vue {
  commands: Command[] = []

  async created() {
    const { data } = await axios.get('/api/v1/commands')
    this.commands = data
  }

  edit(command) {
    this.$router.push({ name: 'CommandManagerEdit', params: command })
  }

  create(command) {
    this.$router.push({ name: 'CommandManagerEdit' })
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
</style>