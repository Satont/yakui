<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">{{ translate('ui.overlays.name') }}</span>
      </div>
      <input type="text" class="form-control" v-model="name" maxlength="15">
    </div>
    <div class="form-group">
      <label>{{ translate('ui.overlays.data') }}</label>
      <textarea class="form-control" v-model="data" rows="10"></textarea>
    </div>
    <variables></variables>
    <button type="button" class="btn btn-block btn-success" @click="create">{{ translate('ui.create') }}</button>
    <br>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      name: null,
      data: null
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
      this.$socket.emit("create.overlay", { name: this.name, data: this.data })
      this.$router.push("/overlays")
    }
  }
};
</script>