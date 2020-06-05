<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <h1>{{ user.username }}</h1>

      <b-form-group label="Messages" label-for="messages">
        <b-form-input id="messages" size="sm" v-model="user.messages" type="number" required></b-form-input>
      </b-form-group>

       <b-form-group>
        <template slot="label">Bits <b-button size="sm" type="success" variant="success" @click.prevent="addBit">+</b-button></template>

         <div v-for="(bit, index) in user.bits" :key="index" class="mb-1">
            <b-form inline v-if="!bit.delete">
              <label>Message</label>
              <b-input size="sm" class="ml-3" v-model="bit.message"></b-input>
              <label class="ml-3">Amount</label>
              <b-input size="sm" class="ml-3" type="number" v-model.number="bit.amount"></b-input>

              <b-button size="sm" class="ml-3" variant="danger" @click.prevent="del('bits', index)">Delete</b-button>
            </b-form>
         </div>
       </b-form-group>

       <b-form-group>
        <template slot="label">Tips <b-button size="sm" type="success" variant="success" @click.prevent="addTip">+</b-button></template>

         <div v-for="(tip, index) in user.tips" :key="index" class="mb-1">
            <b-form inline>
              <label>Message</label>
              <b-input size="sm" class="ml-3" v-model="tip.message"></b-input>
              <label class="ml-3">Amount</label>
              <b-input size="sm" class="ml-3" type="number" v-model.number="tip.amount"></b-input>
              <label class="ml-3">Currency</label>
              <b-form-select size="sm" class="ml-3" v-model="tip.currency" :options="avaliableCurrency"></b-form-select>

              <b-button size="sm" class="ml-3" variant="danger" @click.prevent="del('tips', index)">Delete</b-button>
            </b-form>
         </div>
       </b-form-group>


      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="delUser" variant="danger" v-if="user.id">Delete</b-button>
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
    id: null,
    username: '',
    messages: 0,
    tips: [],
    bits: []
  }
  delete = {
    bits: [],
    tips: []
  }

  avaliableCurrency = ["RUB", "USD", "EUR", "CAD", "HKD", "ISK", "PHP", "DKK", "HUF", "CZK", "GBP", "RON", "SEK", "IDR", "INR", "BRL", "HRK", "JPY", "THB", "CHF", "MYR", "BGN", "TRY", "CNY", "NOK", "NZD", "ZAR", "MXN", "SGD", "AUD", "ILS", "KRW", "PLN"]

  async onSubmit(event) {
    event.preventDefault()

    await axios.post('/api/v1/users', { user: this.user, delete: this.delete })
  }

  async created() {
    const id = this.$route.params.id as any

    this.user = this.$route.params as any
    const { data } = await axios.get('/api/v1/users/' + id)
    this.user = data
  }

  async delUser() {
    await axios.delete('/api/v1/user', { data: { id: (this.user as any).id } })
  }

  del(where, index) {
    this.delete[where].push(this.user[where][index].id)
    this.user[where].splice(index, 1);
  }

  addBit() {
    this.user.bits.push({
      amount: 0,
      message: null,
      timestamp: Date.now(),
      userId: this.user.id
    })
  }
  
  addTip() {
    this.user.tips.push({
      amount: 0,
      message: null,
      currency: 'RUB',
      timestamp: Date.now(),
      userId: this.user.id
    })
  }
}
</script>