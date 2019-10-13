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
      <p class="lead">
      {{ translate(`ui.events.${show}.description`) }}
      </p>
    </div>
  </div>

  <table class="table table-dark table-sm">
    <thead>
      <tr align="center">
        <th colspan="2">{{ translate('ui.events.avaliableVariables') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(variable, index) in this.$data[show].variables" :key="index">
        <td>{{ variable.name }}</td>
        <td>
          {{ translate(`ui.events.${show}.variables.${variable.name.replace('$', '')}`)}}
        </td>
      </tr>
    </tbody>
  </table>

  <div class="card card-bg" :key="index" v-for="(operation, index) in this.$data[show].operations" style="margin-bottom:15px;">
    <div class="card-body">
      <select class="custom-select" v-model="operation.key" style="margin-bottom:15px;">
        <option value="sendMessage">
          {{ translate('ui.events.operations.sendChatMessage.label') }}
        </option>
      </select>
      <center><label>
        {{ translate('ui.events.operations.sendChatMessage.filterLabel') }}
      </label></center>
      <input type="text" class="form-control" v-model="operation.filter" placeholder="$username === 'moobot'">
      <br>
      <center><label v-if="operation.key === 'sendMessage'">
        {{ translate('ui.events.operations.sendChatMessage.messageLabel') }}
      </label></center>
      <input type="text" class="form-control" v-if="operation.key === 'sendMessage'" v-model="operation.message">
    </div>
    <div class="card-footer text-muted">
      <button type="button" class="btn btn-block btn-danger btn-sm" @click="deleteOperation(index)">
        {{ translate('ui.delete') }}
      </button>
    </div>
  </div>
  <br>
  <button type="button" class="btn btn-block btn-success" @click="save()" style="margin-bottom:5px;">
    {{ translate('ui.save') }}
  </button>
  <button type="button" class="btn btn-block btn-success" @click="addOperation()">
    {{ translate('ui.events.operations.add') }}</button>
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
          { name: '$username' },
          { name: '$amount' },
          { name: '$currency' },
          { name: '$message' }
        ],
        operations: []
      },
      bits: {
        variables: [
          { name: '$username' },
          { name: '$amount' },
          { name: '$message' }
        ],
        operations: []
      },
      sub: {
        variables: [
          { name: '$username' },
          { name: '$subTier' },
          { name: '$message' }
        ],
        operations: []
      },
      resub: {
         variables: [
          { name: '$username' },
          { name: '$subTier' },
          { name: '$subStreak' },
          { name: '$message' }
        ],
        operations: []
      },
      subGift: {
        variables: [
          { name: '$username' },
          { name: '$subTier' },
          { name: '$subStreak' },
          { name: '$subGiftRecipient' },
          { name: '$subGifterCount' }
        ],
        operations: []
      },
      message: {
        variables: [
          { name: '$username' },
        ],
        operations: []
      },
      chatClear: {
        operations: []
      },
      userJoin: {
        variables: [
          { name: '$username' }
        ],
        operations: []
      },
      userPart: {
        variables: [
          { name: '$username' }
        ],
        operations: []
      },
      emoteOnly: {
        variables: [
          { name: '$emoteOnlyState' }
        ],
        operations: []
      },
      hosted: {
        variables: [
          { name: '$username' },
          { name: '$hostedViewers' }
        ],
        operations: []
      },
      hosting: {
        variables: [
          { name: '$username' },
          { name: '$hostingViewers' }
        ],
        operations: []
      },
      raided: {
        variables: [
          { name: '$username' },
          { name: '$raidViewers' }
        ],
        operations: []
      },
      slowMode: {
        variables: [
          { name: '$slowModeState' },
          { name: '$slowModeLength' }
        ],
        operations: []
      },
      subsOnlyChat: {
        variables: [
          { name: '$subsOnlyChatState',  },
        ],
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