<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <h1>{{ user.username }}</h1>

      <b-form-group label="Messages" label-for="messages">
        <b-form-input id="messages" v-model="user.messages" type="number" required></b-form-input>
      </b-form-group>

       <b-form-group>
        <template slot="label">Bits <b-button size="sm" type="success" variant="success" @click.prevent="addBit">+</b-button></template>

         <div v-for="(bit, index) in user.bits" :key="index" class="mb-1">
            <b-form inline>
              <label>Message</label>
              <b-input size="sm" class="ml-3" v-model="bit.message"></b-input>
              <label class="ml-3">Amount</label>
              <b-input size="sm" class="ml-3" v-model="bit.amount"></b-input>
              <b-button size="sm" class="ml-3" variant="danger" @click.prevent="delBit(index)">Delete</b-button>
            </b-form>
         </div>
       </b-form-group>

       <b-form-group>
        <template slot="label">Tips <b-button size="sm" type="success" variant="success" @click.prevent="addTip">+</b-button></template>

         <div v-for="(tip, index) in user.tips" :key="index" class="mb-1">
            <b-form inline>
              <label>Message</label>
              <b-input size="sm" class="ml-3" v-model="bit.message"></b-input>
              <label class="ml-3">Amount</label>
              <b-input size="sm" class="ml-3" v-model="bit.amount"></b-input>
              <b-button size="sm" class="ml-3" variant="danger" @click.prevent="delTip(index)">Delete</b-button>
            </b-form>
         </div>
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

  delBit(index) {
    this.user.bits.splice(index, 1);
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