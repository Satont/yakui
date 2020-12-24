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
        <b-form-input id="message" v-model.trim="greeting.message" required type="text" placeholder="Enter message for user"></b-form-input>
      </b-form-group>

       <b-form-group label="Greeting sound" label-for="sound">
        <b-form-select id="sound" v-model="greeting.sound_file" :options="selectOptions"></b-form-select>
      </b-form-group>

      <div v-if="greeting.sound_file">
        <label for='pitch'>Sound volume: {{ greeting.sound_volume }}</label>
        <b-form-input id='pitch' v-model='greeting.sound_volume' type='range' min='1' max='100' step="1"></b-form-input>
      </div>

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

@Component
export default class GreetingsManagerEdit extends Vue {
  greeting = {
    username: null,
    userId: null,
    enabled: true,
    message: null,
    sound_file: null,
    sound_volume: 50,
  }

  get audiosList(): any[] {
    return this.$store.state.filesList?.filter(s => s.type.startsWith('audio'))?.map(file => ({ value: file.id, text: file.name })) || []
  }

  get selectOptions() {
    return [
      { value: null, text: 'No sound' },
      ...this.audiosList
    ]
  }

  async onSubmit(event) {
    event.preventDefault()

    if (!this.greeting.username && !this.greeting.userId) {
      return alert('Please enter userId or username')
    }

    await this.$axios.post('/greetings', this.greeting)
    await this.$router.push({ name: 'GreetingsManagerList' })
    this.$toast.success('Success')
  }

  async created() {
    const id = this.$route.params.id as any

    if (id) {
      this.greeting = this.$route.params as any

      const { data } = await this.$axios.get('/greetings/' + id)

      this.greeting = data
    }
  }

  async del() {
    await this.$axios.delete('/greetings', {
      data: { id: (this.greeting as any).id },
    })
    this.$toast.success('Success')
  }
}
</script>
