<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Name</span>
      </div>
      <input type="text" class="form-control" v-model="name" maxlength="100">
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Response</span>
      </div>
      <input type="text" class="form-control" v-model="response">
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Cooldown</span>
      </div>
     <input ype="number" required class="form-control" v-model="cooldown">
      <div class="input-group-append">
       <span class="input-group-text" id="inputGroup-sizing-default">seconds</span>
      </div>
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Visible in $keywords variable</span>
      </div>
      <div class="input-group-append">
        <button type="submit" class="btn" v-bind:class="{ 'btn-success': visible, 'btn-danger': !visible }" @click="visible = !visible">
          <span v-show="visible">Visible</span>
          <span v-show="!visible">Not visible</span>
        </button>
      </div>
    </div>
    <br>
    <button type="button" class="btn btn-block btn-success" @click="create">Edit</button>
    <button type="button" class="btn btn-block btn-danger" @click="del()">delete</button>
    <br>
    <variables></variables>
  </div>
</template>

<script>

export default {
  data: function() {
    return {
      id: this.$route.params.id,
      name: this.$route.params.name,
      response: this.$route.params.response,
      cooldown: this.$route.params.cooldown,
      visible: this.$route.params.visible
    };
  },
  watch: {
    name(newVal) {
      let re = /[a-z]\d/gi;
      this.$set(this, "name", newVal.replace(/[^a-z-а-я-0-9 ]+/gi, "").toLowerCase());
    }
  },
  methods: {
    del(keyword, index) {
      this.$socket.emit('delete.keyword', keyword.id)
      this.$router.push("/keywords")
    },
    create() {
      if (!this.name || !this.response) return
      if (this.name.length > 100) return alert('Stop trying to hack me')
      let data = this.$data
      this.$socket.emit('update.keyword', { ...data }, async (err, data) => {
        if (err) return alert(err)
        this.$router.push("/keywords")
      })
    }
  },
  mounted() {
    if (!this.response) {
      this.$socket.emit("list.keywords", {}, (err, list) => {
        let find = list.find(o => o.id === this.id)
        this.id = find.id
        this.name = find.name
        this.response = find.response
        this.cooldown = find.cooldown
        this.visible = find.visible
      })
    }
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>