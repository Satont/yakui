<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Timer name</span>
      </div>
      <input type="text" class="form-control" placeholder="Name of timer" v-model="name">
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Timer interval</span>
      </div>
      <input
        type="number"
        class="form-control"
        placeholder="Interval beetwen messages"
        v-model.number="interval"
      >
      <div class="input-group-append">
        <span class="input-group-text" id="inputGroup-sizing-default">seconds</span>
      </div>
    </div>
    <div class="input-group mb-3" v-for="(response, index) in responses" :key="index">
      <input
        type="text"
        required
        class="form-control"
        placeholder="Text"
        v-model="responses[index]"
      >
      <div class="input-group-append">
        <button type="button" class="btn btn-danger" @click="deleteResponse(index)">Delete</button>
      </div>
    </div>

    <button type="button" class="btn btn-block btn-success" @click="createResponse">+</button>
    <button type="button" class="btn btn-block btn-success" @click="create">Create</button>
    <br>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      name: null,
      interval: null,
      responses: []
    };
  },
  methods: {
    createResponse() {
      this.responses.push("");
    },
    deleteResponse(index) {
      this.responses.splice(index, 1);
    },
    create() {
      let data = {
        name: this.name,
        enabled: true,
        interval: this.interval,
        responses: this.responses
      }
      this.$socket.emit('create.timer', data)
      this.$router.push("/timers")
    }
  }
};
</script>