<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <h1>{{ user.username }}</h1>

      <b-form-group label="Messages" label-for="messages">
        <b-form-input id="messages" size="sm" v-model.number="user.messages" type="number" required></b-form-input>
      </b-form-group>

      <b-form-group>
        <template slot="label">Bits <b-button size="sm" type="success" variant="success" @click="addBit">+</b-button></template>

        <div v-for="(bit, index) in user.bits" :key="bit.timestamp" class="mb-1">
          <b-form inline v-if="!bit.delete">
            <label>Message</label>
            <b-input size="sm" class="ml-3" v-model="bit.message"></b-input>
            <label class="ml-3">Amount</label>
            <b-input size="sm" class="ml-3" type="number" v-model.number="bit.amount"></b-input>

            <b-button size="sm" class="ml-3" variant="danger" @click="del('bits', index)">Delete</b-button>
          </b-form>
        </div>
      </b-form-group>

      <b-form-group>
        <template slot="label">Tips <b-button size="sm" type="success" variant="success" @click="addTip">+</b-button></template>

        <div v-for="(tip, index) in user.tips" :key="tip.timestamp" class="mb-1">
          <b-form inline>
            <label>Message</label>
            <b-input size="sm" class="ml-3" v-model="tip.message"></b-input>
            <label class="ml-3">Amount</label>
            <b-input size="sm" class="ml-3" type="number" v-model.number="tip.amount"></b-input>
            <label class="ml-3">Currency</label>
            <b-form-select size="sm" class="ml-3" v-model="tip.currency" :options="avaliableCurrency"></b-form-select>

            <b-button size="sm" class="ml-3" variant="danger" @click="del('tips', index)">Delete</b-button>
          </b-form>
        </div>
      </b-form-group>

      <b-form-group label="Points" label-for="points">
        <b-form-input id="points" size="sm" v-model.number="user.points" type="number" required></b-form-input>
      </b-form-group>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="delUser" variant="danger" v-if="user.id">Delete</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class UsersManagerEdit extends Vue {
  user = {
    id: null,
    username: '',
    messages: 0,
    tips: [],
    bits: [],
    points: 0,
  };
  delete = {
    bits: [],
    tips: [],
  };

  avaliableCurrency = [
    'RUB',
    'USD',
    'EUR',
    'CAD',
    'HKD',
    'ISK',
    'PHP',
    'DKK',
    'HUF',
    'CZK',
    'GBP',
    'RON',
    'SEK',
    'IDR',
    'INR',
    'BRL',
    'HRK',
    'JPY',
    'THB',
    'CHF',
    'MYR',
    'BGN',
    'TRY',
    'CNY',
    'NOK',
    'NZD',
    'ZAR',
    'MXN',
    'SGD',
    'AUD',
    'ILS',
    'KRW',
    'PLN',
  ];

  async onSubmit(event) {
    event.preventDefault();

    await this.$axios.post('/users', { user: this.user, delete: this.delete });
    this.$toast.success('Success');
  }

  async created() {
    const id = this.$route.params.id as any;

    this.user = this.$route.params as any;
    const { data } = await this.$axios.get('/users/' + id);
    (this.user.id = data.id), (this.user.username = data.username);
    this.user.messages = data.messages;
    this.user.tips = data.tips;
    this.user.bits = data.bits;
    this.user.points = data.points;
  }

  async delUser() {
    await this.$axios.delete('/users', {
      data: { id: (this.user as any).id },
    });
    this.$toast.success('Success');
  }

  del(where, index) {
    this.delete[where].push(this.user[where][index].id);
    this.user[where].splice(index, 1);
  }

  addBit() {
    this.user.bits.push({
      amount: 0,
      message: null,
      timestamp: Date.now(),
      userId: this.user.id,
    });
  }

  addTip() {
    this.user.tips.push({
      amount: 0,
      message: null,
      currency: 'RUB',
      timestamp: Date.now(),
      userId: this.user.id,
    });
  }
}
</script>
