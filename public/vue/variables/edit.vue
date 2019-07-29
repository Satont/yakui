<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Name</span>
      </div>
      <input type="text" class="form-control" v-model="name">
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Value</span>
      </div>
      <input type="text" class="form-control" v-model="value">
    </div>
    <button type="button" class="btn btn-block btn-success" @click="create">Save</button>
    <br>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      name: this.$route.params.name,
      value: this.$route.params.value
    };
  },
  methods: {
    create() {
       let currentname = window.location.href.split('/')
       this.$socket.emit('update.variable', { currentname: currentname[currentname.length - 1], name: this.name, value: this.value })
       this.$router.push("/variables")
    }
  },
  mounted() {
    if (!this.value) {
      this.$socket.emit("list.variables", {}, (err, list) => {
        let find = list.find(o => o.name === this.name)
        this.name = find.name
        this.value = find.value
      })
    }
  }
};
</script>