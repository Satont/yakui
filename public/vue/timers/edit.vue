<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Timer name</span>
      </div>
      <input type="text" class="form-control" v-model="name">
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Timer interval</span>
      </div>
      <input type="number" v-model.number="interval" class="form-control">
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
    <button type="button" class="btn btn-block btn-success" @click="save">Save</button>
    <br>
  </div>
</template>

<script>

export default {
  data: function() {
    return {
      name: this.$route.params.name,
      interval: this.$route.params.interval,
      responses: this.$route.params.responses
    };
  },
  methods: {
    createResponse() {
      this.responses.push("");
    },
    deleteResponse(index) {
      this.responses.splice(index, 1);
    },
    save() {
      this.$socket.emit("update.timer", { name: this.name, interval: this.interval, responses: this.responses })
    }
  },
  mounted() {
    if (!this.interval) {
      this.$socket.emit("list.timers", {}, (err, list) => {
        let find = list.find(o => o.name === this.name)
        this.name = find.name
        this.responses = find.responses
        this.interval = find.interval
      })
    }
  },
  sockets: {
    connect: function() {
      console.log("timer socket connected");
    }
  }
};
</script>