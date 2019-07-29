<template>
<div>
  <center><h3>Users settings</h3></center>
  <button type="button" class="btn btn-block btn-sm" v-bind:class="{ 'btn-success': enabled, 'btn-danger': !enabled }"
  @click="enabled = !enabled">
    <span v-show="enabled">Enabled</span>
    <span v-show="!enabled">Disabled</span>
  </button>
  <button type="button" class="btn btn-block btn-sm btn-info" @click="save" style="margin-top: 5px;">Save</button>
  <br>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Points per message</span>
    </div>
    <input type="number" class="form-control" v-model.number="pointsPerMessage">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Points per 1 minute of online</span>
    </div>
    <input type="number" class="form-control" v-model.number="pointsPerTime">
  </div>
</div>
</template>

<script>
export default {
  data: function() {
    return {
      enabled: false,
      pointsPerMessage: 0,
      pointsPerTime: 0
    };
  },
  mounted() {
    let self = this;
    this.$socket.emit('settings.users', null, (err, list) => {
      this.enabled = list.data.enabled
      this.pointsPerMessage = list.data.pointsPerMessage
      this.pointsPerTime = list.data.pointsPerTime
    })
  },
  methods: {
    save() {
      this.$socket.emit('update.settings.users', this.$data)
    }
  }
};
</script>