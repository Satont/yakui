<template>
  <div>
    <button type="button" class="btn btn-block btn-success" @click="goToCreate">{{ translate('commands.ui.create') }}</button>
    <br>
    <div class="row cards">
      <div class="col-md-6" :key="index" v-for="(command, index) in commands">
        <div class="card bg-dark">
          <div class="card-header">{{ command.name }} <span class="badge badge-primary float-right">{{ command.cooldown }} sec.</span></div>
          <div class="card-body">
            <span class="badge badge-light card-span">{{ command.response | truncate(150, '...') }}</span>
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
          id: command.id,
          name: command.name,
          response: command.response,
          permission: command.permission,
          description: command.description,
          cooldown: command.cooldown,
          cooldowntype: command.cooldowntype,
          cooldownfor: command.cooldownfor,
          aliases: command.aliases,
          visible: command.visible
        }
      });
    }
  },
  filters: {
    truncate: function (text, length, suffix) {
      if (text.length > length) return text.substring(0, length) + suffix
      else return text
    }
  },
  mounted() {
    this.$socket.emit('list.commands', null, (err, list) => this.commands = orderBy(list, 'name', 'asc'))
  },
  updated() {
    this.$socket.emit('list.commands', null, (err, list) => this.commands = orderBy(list, 'name', 'asc'))
  }
};
</script>