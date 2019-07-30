<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Name</span>
      </div>
      <input type="text" class="form-control" placeholder="Name of variable" v-model="name" maxlength="15">
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Value</span>
      </div>
      <input
        type="text"
        required
        class="form-control"
        placeholder="Variable value"
        v-model="value"
      >
    </div>
    <button type="button" class="btn btn-block btn-success" @click="create">Create</button>
    <br>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      name: null,
      value: null
    };
  },
  watch: {
    name(newVal) {
      let re = /[a-z]\d/gi;
      this.$set(this, "name", newVal.replace(/[^a-z-а-я-0-9]+/gi, "").toLowerCase());
    }
  },
  methods: {
    create() {
      this.$socket.emit("create.variable", { name: this.name, value: this.value })
      this.$router.push("/variables")
    }
  }
};
</script>