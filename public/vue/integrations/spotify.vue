<template>
<div>
    <button type="button" class="btn btn-block btn-sm" @click="enabled = !enabled" v-bind:class="{ 'btn-success': enabled, 'btn-danger': !enabled }">
      <span v-show="enabled">Enabled</span>
      <span v-show="!enabled">Disabled</span>
      </button>
    <button type="button" class="btn btn-block btn-sm btn-info" @click="save" style="margin-top: 5px;">Authorize!</button>
    <br>
    <div class="input-group input-group-sm mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-sm">clientId</span>
      </div>
      <input class="form-control" v-model="settings.clientId">
    </div>
    <div class="input-group input-group-sm mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-sm">clientSecret</span>
      </div>
      <input class="form-control" v-model="settings.clientSecret">
    </div>
    <div class="input-group input-group-sm mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-sm">redirectUri</span>
      </div>
      <input class="form-control" v-model="settings.redirectUri">
    </div>
</div>
</template>

<script>
export default {
  data: function() {
    return {
      enabled: false,
      settings: {
        clientId: null,
        clientSecret: null,
        redirectUri: null
      }
    };
  },
  mounted() {
    let self = this;
    this.$socket.emit('settings.spotify', null, (err, settings) => {
      this.enabled = settings.enabled
      this.settings = settings.settings
    })
  },
  methods: {
    save() {
      this.$socket.emit('spotify.auth', this.$data, async (err, data) => {
        if (err)  {
          alert('Some problem with your settings');
          console.log(err)
        }
        else {
          console.log(data)
          window.location.href = data
        }
      })
    }
  },
};
</script>