<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Name</span>
      </div>
      <input type="text" class="form-control" v-model="name" maxlength="15">
    </div>
    <div class="form-group">
      <label>Overlay data</label>
      <textarea class="form-control" v-model="data" rows="20"></textarea>
    </div>
    <button type="button" class="btn btn-block btn-success" @click="create">Save</button>
    <br>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      id: this.$route.params.id,
      name: this.$route.params.name,
      data: this.$route.params.data
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
       this.$socket.emit('update.overlay', { id: this.id, name: this.name, data: this.data })
       this.$router.push("/overlays")
    }
  },
  mounted() {
    if (!this.value) {
      this.$socket.emit("list.overlays", {}, (err, list) => {
        let find = list.find(o => o.id === this.id)
        this.name = find.name
        this.data = find.data
      })
    }
  }
};
</script>