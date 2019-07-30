<template>
<div>
    <button type="button" class="btn btn-block btn-sm" @click="enabled = !enabled" v-bind:class="{ 'btn-success': enabled, 'btn-danger': !enabled }">
      <span v-show="enabled">Enabled</span>
      <span v-show="!enabled">Disabled</span>
      </button>
    <button type="button" class="btn btn-block btn-sm btn-info" @click="save" style="margin-top: 5px;">Save</button>
    <br>
    <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Secret token</span>
    </div>
    <input class="form-control" v-model="token">
    <div class="input-group-append">
        <button class="btn btn-info" type="button" id="popover" data-toggle="popover" title="Where to get token?" data-content="Settings -> Secret token">?</button>
    </div>
  </div>
</div>
</template>

<script>
export default {
  data: function() {
    return {
      enabled: false,
      token: null
    };
  },
  mounted() {
    let self = this;
    this.$socket.emit('settings.qiwi', null, (err, settings) => {
      this.enabled = settings.enabled
      this.token = settings.settings.token
    })
    $('#popover').popover()
  },
  methods: {
    save() {
      let data = { enabled: this.enabled, settings: { token: this.token } }
      this.$socket.emit('update.settings.qiwi', data)
    }
  },
};
</script>

<style>
.popover-header {
  color:#000;
}
</style>
