<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <b-form-group label="Timer name" label-for="name">
        <b-form-input id="name" v-model="timer.name" type="text" required placeholder="Enter timer name"></b-form-input>
      </b-form-group>

      <b-form-group label="Timer interval" label-for="interval">
        <b-form-input id="interval" v-model.number="timer.interval" type="number" required placeholder="Enter timer interval"></b-form-input>
      </b-form-group>

       <b-form-group label="Timer responses">
         <b-input-group size="sm" v-for="(response, index) in timer.responses" :key="index" class="mb-1">
            <b-form-input v-model="timer.responses[index]" type="text" placeholder="Timer response"></b-form-input>
            <b-input-group-append><b-button size="sm" variant="danger" @click.prevent="delResponse(index)">Delete</b-button></b-input-group-append>
         </b-input-group>
         <b-button class="mt-1" block size="sm" type="success" variant="success" @click.prevent="addResponse">+</b-button>
       </b-form-group>

      <b-button class="btn-block" variant="success" v-if="timer.enabled" v-on:click="timer.enabled = !timer.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!timer.enabled" v-on:click="timer.enabled = !timer.enabled">Disabled</b-button>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="del" variant="danger" v-if="timer.id">Delete</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import Timer from '@bot/models/Timer'
import axios from 'axios'

@Component({})
export default class TimersManagerEdit extends Vue {
  timer = {
    name: null,
    enabled: true,
    responses: [],
    interval: 60,
  }

  async onSubmit(event) {
    event.preventDefault()
    this.filterResponses()

    if (!this.timer.responses.length) {
      return alert('Responses cannot be empty')
    }

    await axios.post('/api/v1/timers', this.timer, { headers: {
      'x-twitch-token': localStorage.getItem('accessToken')
    }})
    await this.$router.push({ name: 'TimersManagerList' })
  }

  filterResponses() {
    this.timer.responses = this.timer.responses.filter(o => o !== '' && o)
  }

  async created() {
    const id = this.$route.params.id as any

    if (id) {
      this.timer = this.$route.params as any

      const { data } = await axios.get('/api/v1/timers/' + id, { headers: {
      'x-twitch-token': localStorage.getItem('accessToken')
      }})

      this.timer = data
    }
  }

  async del() {
    await axios.delete('/api/v1/timers', {
      data: { id: (this.timer as any).id },
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      }
    })
  }

  addResponse() {
    this.timer.responses.push(null);
  }

  delResponse(index) {
    this.timer.responses.splice(index, 1);
  }
}
</script>
