<template>
  <div>
    <h1>Events</h1>

    <div id="navigation">
      <a @click="show = 'follow'" class="btn btn-primary btn-sm">Follow</a>
      <a @click="show = 'newmod'" class="btn btn-primary btn-sm">New Moderator</a>
      <a @click="show = 'removemod'" class="btn btn-primary btn-sm">Moderator Removed</a>
      <a @click="show = 'tip'" class="btn btn-primary btn-sm">Tip</a>
      <a @click="show = 'message'" class="btn btn-primary btn-sm">Message</a>
      <a @click="show = 'bits'" class="btn btn-primary btn-sm">Bits</a>
      <a @click="show = 'sub'" class="btn btn-primary btn-sm">Sub</a>
      <a @click="show = 'resub'" class="btn btn-primary btn-sm">Resub</a>
      <a @click="show = 'hosted'" class="btn btn-primary btn-sm">Hosted</a>
      <a @click="show = 'hosting'" class="btn btn-primary btn-sm">Hosting</a>
      <a @click="show = 'raided'" class="btn btn-primary btn-sm">Raided</a>
    </div>
  <div class="jumbotron jumbotron-fluid">
      <h1 class="display-4">{{ show }} event</h1>
      <p class="lead">{{ this.$data[show].description }}</p>
  </div>

  <table class="table table-dark table-sm">
    <thead>
      <tr align="center">
        <th colspan="2">Avalible variables for {{ show }} event</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(variable, index) in this.$data[show].variables" :key="index">
        <td>{{ variable.name }}</td>
        <td>{{ variable.description }}</td>
      </tr>
    </tbody>
  </table>

  <div class="card card-bg" :key="index" v-for="(operation, index) in this.$data[show].operations" style="margin-bottom:15px;">
    <div class="card-body">
      <select class="custom-select" v-model="operation.key" style="margin-bottom:15px;">
        <option value="sendMessage">Send Chat Message</option>
      </select>
      <center><label>Filter of operation (javascript)</label></center>
      <input type="text" class="form-control" v-model="operation.filter" placeholder="$username === 'moobot'">
      <br>
      <center><label v-if="operation.key === 'sendMessage'">Message for sending</label></center>
      <input type="text" class="form-control" v-if="operation.key === 'sendMessage'" v-model="operation.message" placeholder="Message for sending">
    </div>
    <div class="card-footer text-muted">
      <button type="button" class="btn btn-block btn-danger btn-sm" @click="deleteOperation(index)">Delete</button>
    </div>
  </div>
  <br>
  <button type="button" class="btn btn-block btn-success" @click="save()" style="margin-bottom:5px;">Save</button>
  <button type="button" class="btn btn-block btn-success" @click="addOperation()">Add new opperation</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from '../../components/axios'
import Event from '@bot/models/Event'

export default Vue.extend({
  data: () => ({
    show: 'follow',
    follow: {
      variables: [
        { name: '$username', description: 'Username of user who followed' },
      ],
      description: 'Triggering when channel got new follower.',
      operations: []
    },
    newmod: {
      variables: [
        { name: '$username', description: 'Username of user who got moderated' },
      ],
      description: 'Triggering when channel got new moderator.',
      operations: []
    },
    removemod: {
      variables: [
        { name: '$username', description: 'Username of user who lost moderation' },
      ],
      description: 'Triggering when channel lost some moderator.',
      operations: []
    },
    message: {
      variables: [
        { name: '$username', description: 'Username of user who donated' },
        { name: '$message', description: 'Typed message' },
      ],
      description: 'Triggering when someone post message in chat',
      operations: []
    },
    tip: {
      variables: [
        { name: '$username', description: 'Username of user who donated' },
        { name: '$amount', description: 'How much donated' },
        { name: '$currency', description: 'Currency of donate' },
        { name: '$message', description: 'Message of donation' }
      ],
      description: 'Triggering when you get some donation',
      operations: []
    },
    bits: {
      variables: [
        { name: '$username', description: 'Username of user who donated' },
        { name: '$amount', description: 'How much donated' },
        { name: '$message', description: 'Message of donation' }
      ],
      description: 'Triggering when you get some cheers',
      operations: []
    },
    sub: {
      variables: [
        { name: '$username', description: 'Username of user who subscribed' },
        { name: '$sub.tier', description: 'Tier of sub. Twitch prime/1/2/3/' },
        { name: '$message', description: 'Message of resub' }
      ],
      description: 'Triggering when some user did subscribtion',
      operations: []
    },
    resub: {
      variables: [
        { name: '$username', description: 'Username of user who resubscribed' },
        { name: '$sub.tier', description: 'Tier of sub. Twitch prime/1/2/3/' },
        { name: '$sub.months', description: 'Cumulative streak of user months' },
        { name: '$message', description: 'Message of resub' }
      ],
      description: 'Triggering when some user did resubscribtion',
      operations: []
    },
    subGift: {
      variables: [
        { name: '$username', description: 'Username of user who gifted sub' },
        { name: '$sub.tier', description: 'Tier of sub. Twitch prime/1/2/3/' },
        { name: '$sub.months', description: 'Cumulative streak of user months' },
        { name: '$subgift.recipient', description: 'Username of recipient user' },
      ],
      description: 'Triggering when some user gift subscribtion to another user',
      operations: []
    },
    hosted: {
      variables: [
        { name: '$username', description: 'Username who started host' },
        { name: '$viewers', description: 'Viewers of host' }
      ],
      description: 'Triggering when you got hosted',
      operations: []
    },
    hosting: {
      variables: [
        { name: '$username', description: 'Username of target' },
        { name: '$viewers', description: 'Viewers of host' }
      ],
      description: 'Triggering when yuo starting host',
      operations: []
    },
    raided: {
      variables: [
        { name: '$username', description: 'Username raider' },
        { name: '$viewers', description: 'Viewers of raid' }
      ],
      description: 'Triggering when someone start to raid you',
      operations: []
    }
  }),
  async created() {
    const { data }: { data: Event[] } = await axios.get('/events')

    for (const event of data) {
      this[event.name].operations = event.operations
    }
  },
  methods: {
    addOperation: function () {
      this[this.show].operations.push({ key: 'sendMessage', message: '' })
    },
    deleteOperation: function (index) {
      this[this.show].operations.splice(index, 1)
    },
    save: async function () {
      await axios.post('/events', { name: this.show, operations: this[this.show].operations })
    }
  }
})
</script>

<style scoped>
.card-bg {
  background-color: #50585f !important
}
#navigation {
  list-style: none;
  margin: 20px 0;
  overflow: hidden;
}
#navigation a {
  display: inline-block;
  padding-top: 5px;
}
.jumbotron {
  color: #212529;
  padding: 15px !important;
}
.display-4::first-letter {
  text-transform: uppercase;
}
</style>
