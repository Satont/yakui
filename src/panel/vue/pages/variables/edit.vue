<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <b-form-group label="Name" label-for="name">
        <b-form-input id="name" v-model="variable.name" type="text" required placeholder="Enter variable name"></b-form-input>
      </b-form-group>

      <b-form-group label="Response" label-for="response">
        <b-form-input id="response" v-model="variable.response" type="text" required placeholder="Enter variable response"></b-form-input>
      </b-form-group>


      <b-button class="btn-block" variant="success" v-if="variable.enabled" v-on:click="variable.enabled = !variable.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!variable.enabled" v-on:click="variable.enabled = !variable.enabled">Disabled</b-button>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="del" variant="danger" v-if="variable.id">Delete</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import Variable from '../../../../bot/models/Variable'
import axios from 'axios'

@Component({})
export default class CustomVariablesManagerEdit extends Vue {
  variable = {
    name: null,
    enabled: true,
    response: null,
  }

  async onSubmit(event) {
    event.preventDefault()

    await axios.post('/api/v1/variables', this.variable)
    await this.$router.push({ name: 'CustomVariablesManagerList' })
  }


  async created() {
    const id = this.$route.params.id as any

    if (id) {
      this.variable = this.$route.params as any

      const { data } = await axios.get('/api/v1/variables/' + id)

      this.variable = data
    }
  }

  async del() {
    await axios.delete('/api/v1/variables', { data: { id: (this.variable as any).id } })
  }
}
</script>