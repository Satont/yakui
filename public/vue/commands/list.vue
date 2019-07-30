<template>
  <div>
    <button type="button" class="btn btn-block btn-success" @click="goToCreate">Create command</button>
    <br>
    <div class="row cards">
      <div class="col-md-6" :key="index" v-for="(command, index) in commands">
        <div class="card bg-dark">
          <div class="card-header">{{ command.name }}<span v-if="command.aliases.length"> | {{ command.aliases.join(', ') }}</span><span class="badge badge-primary float-right">{{ command.cooldown }} sec.</span></div>
          <div class="card-body">
            <span class="badge badge-light card-span">{{ command.response }}</span>
          </div>
          <div class="card-footer">
            <div class="btn-group d-flex" role="group" aria-label="Basic example">
              <button
                type="button"
                class="btn btn-block btn-sm btn-info w-100"
                @click="editCommand(command)"
              >Edit</button>
              <button
                type="button"
                class="btn btn-sm btn-danger w-100"
                @click="deleteCommand(command.name, index)"
              >Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { orderBy } from 'lodash'

export default {
  data: function() {
    return {
      commands: []
    };
  },
  methods: {
    goToCreate() {
      this.$router.push("commands/create");
    },
    deleteCommand(command, index) {
      this.$socket.emit('delete.command', command)
      this.commands.splice(index, 1);
    },
    editCommand(command) {
      this.$router.push({
        name: "editCommand",
        params: {
          name: command.name,
          response: command.response,
          cooldown: command.cooldown,
          cooldowntype: command.cooldowntype,
          aliases: command.aliases
        }
      });
    }
  },
  mounted() {
    this.$socket.emit('list.commands', null, (err, list) => this.commands = _.orderBy(list, 'name', 'asc'))
  },
  updated() {
    this.$socket.emit('list.commands', null, (err, list) => this.commands = _.orderBy(list, 'name', 'asc'))
  }
};
</script>