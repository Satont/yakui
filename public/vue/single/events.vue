<template>
<div>
  <center><h2>Events</h2></center>
  <div id="navigation">
    <a @click="show = 'tips'" class="btn btn-primary btn-sm">Tip</a>
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
  <div>
    <div class="card bg-dark" :key="index" v-for="(operation, index) in this.$data[show]" style="margin-bottom:15px;">
      <div class="card-body">
        <select class="custom-select" v-model="operation.key" style="margin-bottom:15px;">
          <option value="sendMessage">Send Chat Message</option>
        </select>
        <input type="text" class="form-control" v-if="operation.key === 'sendMessage'" v-model="operation.message" placeholder="Message for sending">
      </div>
    </div>
  </div>
  <br>
  <button type="button" class="btn btn-block btn-success" @click="addOperation()">Add new opperation</button>
</div>
</template>

<script>
export default {
  data: function() {
    return {
      show: 'tips',
      tips: [],
      bits: [],
      sub: [],
      resub: [],
      subGift: [],
      message: [],
      chatClear: [],
      userJoin: [],
      userPart: [],
      emoteOnly: [],
      hosted: [],
      hosting: [],
      raided: [],
      slowMode: [],
      subsOnlyChat: []
    };
  },
  mounted() {
    let self = this;
    this.$socket.emit('list.variables', null, (err, list) => this.variables = list)
  },
  methods: {
    addOperation: function () {
      this[this.show].push({ key: 'sendMessage', message: '' })
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
</style>