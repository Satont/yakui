<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <h1>{{ user.username }}</h1>

      <b-form-group label="Messages" label-for="messages">
        <b-form-input id="messages" v-model="user.messages" type="number" required></b-form-input>
      </b-form-group>

       <b-form-group label="Bits">
         <b-input-group size="sm" v-for="(bit, index) in user.bits" :key="index" class="mb-1">
            {{ user.bits[index] }}
            <b-input-group-append><b-button size="sm" variant="danger" @click.prevent="delBit(index)">Delete</b-button></b-input-group-append>
         </b-input-group>
         <b-button class="mt-1" block size="sm" type="success" variant="success" @click.prevent="addBit">+</b-button>
       </b-form-group>


      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="del" variant="danger" v-if="user.id">Delete</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import axios from 'axios'

@Component({})
export default class UsersManagerEdit extends Vue {
  user = {
    username: '',
    messages: 0,
    tips: [],
    bits: []
  }

  async onSubmit(event) {
    event.preventDefault()

    await axios.post('/api/v1/users', this.user)
    await this.$router.push({ name: 'UsersManagerList' })
  }

  async created() {
    const id = this.$route.params.id as any
    console.log(this.$route.params)
    this.user = this.$route.params as any
    const { data } = await axios.get('/api/v1/users/' + id)
    this.user = data
  }

  async del() {
    await axios.delete('/api/v1/user', { data: { id: (this.user as any).id } })
  }

  delBit() {

  }

  addBit() {
    this.user.bits.push({
      amount: 0,
      message: null,
      timestamp: new Date().getTime(),
      userId: (this.user as any).id
    })
  }
}
</script>