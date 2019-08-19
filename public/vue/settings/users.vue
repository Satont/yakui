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
      <span class="input-group-text" id="inputGroup-sizing-sm">Points name</span>
    </div>
    <input type="text" class="form-control" v-model="pointsName">
    <div class="input-group-append">
        <button class="btn btn-info" type="button" data-toggle="modal" data-target="#pointsinfo">?</button>
      </div>
  </div>
   <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Points each X message</span>
    </div>
    <input type="number" class="form-control" v-model.number="pointsMessageInterval">
    <div class="input-group-append">
      <span class="input-group-text" id="inputGroup-sizing-sm">number</span>
    </div>
  </div>
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
  <div class="form-group">
    <label for="exampleFormControlTextarea1">Ignore list of users (one record per line)</label>
    <textarea type="text" class="form-control" v-model="ignorelist" rows="15"></textarea>
  </div>

  <div class="modal fade bd-example-modal-lg" id="pointsinfo" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Information about points naming</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" style="color:#000">
          You should pass points name like: point|points|points <br>
          Why 3 parameters? Because some languages have declension of numbers. <br> 
          For example in russian: душа|души|душ ---> 1|2,3,4 e.t.c|5,6,7 e.t.c
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

</div>
</template>

<script>
export default {
  data: function() {
    return {
      enabled: false,
      pointsMessageInterval: 0,
      pointsPerMessage: 0,
      pointsPerTime: 0,
      pointsName: null,
      ignorelist: null
    };
  },
  mounted() {
    let self = this;
    this.$socket.emit('settings.users', null, (err, list) => {
      this.enabled = list.data.enabled
      this.pointsMessageInterval = list.data.pointsMessageInterval
      this.pointsPerMessage = list.data.pointsPerMessage
      this.pointsPerTime = list.data.pointsPerTime
      this.pointsName = list.data.pointsName
      this.ignorelist = list.data.ignorelist.join('\n')
    })
  },
  methods: {
    save() {
      this.$data.ignorelist = this.$data.ignorelist.toLowerCase().split('\n')
      this.$socket.emit('update.settings.users', this.$data)
      this.$data.ignorelist = this.$data.ignorelist.join('\n')
    }
  }
};
</script>