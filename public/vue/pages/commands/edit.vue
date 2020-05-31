<template>
  <div>
    <b-form @submit="onSubmit" @reset="onReset">
      <b-form-group label="Command name" label-for="name">
        <b-form-input id="name" v-model="command.name" type="text" required placeholder="Enter command name"></b-form-input>
      </b-form-group>

      <b-form-group label="Command cooldown" label-for="cooldown">
        <b-form-input id="cooldown" v-model="command.cooldown" type="number" placeholder="Enter command cooldown"></b-form-input>
      </b-form-group>

      <b-form-group label="Command visibility" label-for="visibility">
        <button class="btn" v-bind:class="{ 'btn-success': command.visible, 'btn-danger': !command.visible }" @click="command.visible = !command.visible">
          <span v-show="command.visible">Visible</span>
          <span v-show="!command.visible">Not visible</span>
        </button>
      </b-form-group>


      <b-button type="submit" variant="primary">Submit</b-button>
      <b-button type="reset" variant="danger">Reset</b-button>
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
  command = {
    name: '',
    response: '',
    cooldown: 10,
    visible: true,
  }

  async created() {
    const id = this.$route.params.id as any

    if (id) {
      this.command = this.$route.params as any

      const { data } = await axios.get('/api/v1/commands/' + id)
      this.command = data
    }
  }
}
</script>