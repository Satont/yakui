<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <b-form-group label="Greeting username" label-for="name">
        <b-form-input id="name" :formatter="(v) => v.toLowerCase()" v-model.trim="greeting.username" type="text" placeholder="Enter username"></b-form-input>
      </b-form-group>

      <b-form-group label="Greeting userId" label-for="userId">
        <b-form-input id="userId" v-model.number="greeting.userId" type="number" placeholder="Enter userId"></b-form-input>
      </b-form-group>

      <b-form-group>
        <template slot="label" label-for="message">
           Greeting message <variables-list></variables-list>
        </template>
        <b-form-input id="message" v-model.trim="greeting.message" type="text" placeholder="Enter message for user"></b-form-input>
      </b-form-group>

      <b-button class="btn-block" variant="success" v-if="greeting.enabled" v-on:click="greeting.enabled = !greeting.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!greeting.enabled" v-on:click="greeting.enabled = !greeting.enabled">Disabled</b-button>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="del" variant="danger" v-if="greeting.id">Delete</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import axios from 'axios'

@Component({})
export default class GreetingsManagerEdit extends Vue {
  greeting = {
    username: null,
    userId: null,
    enabled: true,
    message: null,
  }

  async onSubmit(event) {
    event.preventDefault()

    if (!this.greeting.username && !this.greeting.userId) {
      return alert('Please enter userId or username')
    }

    await axios.post('/api/v1/greetings', this.greeting, { headers: {
      'x-twitch-token': localStorage.getItem('accessToken')
    }})
    await this.$router.push({ name: 'GreetingsManagerList' })
  }


  async created() {
    const id = this.$route.params.id as any

    if (id) {
      this.greeting = this.$route.params as any

      const { data } = await axios.get('/api/v1/greetings/' + id, { headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      }})

      this.greeting = data
    }
  }

  async del() {
    await axios.delete('/api/v1/greetings', {
      data: { id: (this.greeting as any).id },
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      }
    })
  }
}
</script>
