<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">{{ translate('ui.variables.name') }}</span>
      </div>
      <input type="text" class="form-control" v-model="name" maxlength="15">
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">{{ translate('ui.variables.value') }}</span>
      </div>
      <input type="text" class="form-control" v-model="value">
    </div>
    <button type="button" class="btn btn-block btn-success" @click="create">{{ translate('ui.save') }}</button>
    <br>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      id: this.$route.params.id,
      name: this.$route.params.name,
      value: this.$route.params.value
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
       if (this.name.length > 15) return alert('Stop trying to hack me')
       let currentname = window.location.href.split('/')
       this.$socket.emit('update.variable', { currentname: currentname[currentname.length - 1], name: this.name, value: this.value })
       this.$router.push("/variables")
    }
  },
  mounted() {
    if (!this.value) {
      this.$socket.emit("list.variables", {}, (err, list) => {
        let find = list.find(o => o.name === Number(this.id))
        if (!find) return this.$router.push('/variables')
        this.id = find.id
        this.name = find.name
        this.value = find.value
      })
    }
  }
};
</script>