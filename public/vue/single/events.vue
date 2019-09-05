<template>
<div>
  <center><h2>Events</h2></center>
  <div id="navigation">
    <a @click="show = 'tip'" class="btn btn-primary btn-sm">Tip</a>
    <a @click="show = 'bits'" class="btn btn-primary btn-sm">Bits</a>
    <a @click="show = 'sub'" class="btn btn-primary btn-sm">Sub</a>
    <a @click="show = 'resub'" class="btn btn-primary btn-sm">Resub</a>
    <a @click="show = 'subGift'" class="btn btn-primary btn-sm">Sub Gift</a>
    <a @click="show = 'message'" class="btn btn-primary btn-sm">Message</a>
    <a @click="show = 'chatClear'" class="btn btn-primary btn-sm">Chat Clear</a>
    <a @click="show = 'userJoin'" class="btn btn-primary btn-sm">User join</a>
    <a @click="show = 'userPart'" class="btn btn-primary btn-sm">User part</a>
    <a @click="show = 'emoteOnly'" class="btn btn-primary btn-sm">Emote Only</a>
    <a @click="show = 'hosted'" class="btn btn-primary btn-sm">Hosted</a>
    <a @click="show = 'hosting'" class="btn btn-primary btn-sm">Hosting</a>
    <a @click="show = 'raided'" class="btn btn-primary btn-sm">Raided</a>
    <a @click="show = 'slowMode'" class="btn btn-primary btn-sm">Slow Mode</a>
    <a @click="show = 'subsOnlyChat'" class="btn btn-primary btn-sm">Subs Only Chat</a>
  </div>
  <div class="jumbotron jumbotron-fluid">
    <div class="container">
      <h1 class="display-4">{{ show }} event</h1>
      <p class="lead">{{ this.$data[show].description }}</p>
    </div>
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

  <div class="card bg-dark" :key="index" v-for="(operation, index) in this.$data[show].operations" style="margin-bottom:15px;">
    <div class="card-body">
      <select class="custom-select" v-model="operation.key" style="margin-bottom:15px;">
        <option value="sendMessage">Send Chat Message</option>
      </select>
      <center><label>Filter of operation (javascript)</label></center>
      <input type="text" class="form-control" v-model="operation.filter" placeholder="$username === 'sadisnamenya'">
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

<script>
import { isPlainObject } from 'lodash'

export default {
  data: function() {
    return {
      show: 'tip',
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
          { name: '$username', description: 'Username of user who donated' },
          { name: '$subTier', description: 'Tier of sub. Twitch prime/1/2/3/' },
          { name: '$message', description: 'Message of sub' }
        ],
        description: 'Triggering when you get new subscriber',
        operations: []
      },
      resub: {
         variables: [
          { name: '$username', description: 'Username of user who donated' },
          { name: '$subTier', description: 'Tier of sub. Twitch prime/1/2/3/' },
          { name: '$subStreak', description: 'Cumulative streak of user months' },
          { name: '$message', description: 'Message of resub' }
        ],
        description: 'Triggering when some user did resubscribtion',
        operations: []
      },
      subGift: {
        variables: [
          { name: '$username', description: 'Username of user who donated' },
          { name: '$subTier', description: 'Tier of sub. Twitch prime/1/2/3/' },
          { name: '$subStreak', description: 'Cumulative streak of user months' },
          { name: '$subGiftRecipient', description: 'Username of recipient user' },
          { name: '$subGifterCount', description: 'Gifted subs count by $username' }
        ],
        description: 'Triggering when some user gift subscribtion to another user',
        operations: []
      },
      message: {
        description: 'Triggering when some chat message appears',
        variables: [
          { name: '$username', description: 'Username of user who sent message' },
        ],
        operations: []
      },
      chatClear: {
        description: 'Triggering when chat was cleared',
        operations: []
      },
      userJoin: {
        variables: [
          { name: '$username', description: 'Username who joined chat' }
        ],
        description: 'Triggering when some user joined channel',
        operations: []
      },
      userPart: {
        variables: [
          { name: '$username', description: 'Username who parted chat' }
        ],
        description: 'Triggering when some user parted channel',
        operations: []
      },
      emoteOnly: {
        variables: [
          { name: '$emoteOnlyState', description: 'Showing does emoteonly enabled or disabled' }
        ],
        description: 'Triggering when emote only was enabled/disabled on channel',
        operations: []
      },
      hosted: {
        variables: [
          { name: '$username', description: 'Username who started host' },
          { name: '$hostedViewers', description: 'Viewers of host' }
        ],
        description: 'Triggering when you got hosted',
        operations: []
      },
      hosting: {
        variables: [
          { name: '$username', description: 'Username of target' },
          { name: '$hostingViewers', description: 'Viewers of host' }
        ],
        description: 'Triggering when yuo starting host',
        operations: []
      },
      raided: {
        variables: [
          { name: '$username', description: 'Username raider' },
          { name: '$raidViewers', description: 'Viewers of raid' }
        ],
        description: 'Triggering when someone start to raid you',
        operations: []
      },
      slowMode: {
        variables: [
          { name: '$slowModeState', description: 'State of slow mode (enabled/disabled)' },
          { name: '$slowModeLength', description: 'Length of slow mode' }
        ],
        description: 'Triggering when slow mode enabled/disabled in chat',
        operations: []
      },
      subsOnlyChat: {
        variables: [
          { name: '$subsOnlyChatState', description: 'State of subscribers mode (enabled/disabled)' },
        ],
        description: 'Triggering when subscribers only chat enabled',
        operations: []
      }
    };
  },
  mounted() {
    const self = this
    this.$socket.emit('list.events', null, async (err, list) => {
      for (const item of list) {
        self[item.name].operations = isPlainObject(item.operations) ? [] : item.operations
      }
    })
  },
  methods: {
    addOperation: function () {
      this[this.show].operations.push({ key: 'sendMessage', message: '' })
    },
    deleteOperation: function (index) {
      this[this.show].operations.splice(index, 1)
    },
    save: function () {
      const what = { name: this.show, operations: this[this.show].operations }
      this.$socket.emit('events.save', what, async (err, data) => {

      })
    }
  }
};
</script>

<style>
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