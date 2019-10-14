<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">
          {{ translate('ui.keywords.message') }}
        </span>
      </div>
      <input type="text" class="form-control" v-model="name" maxlength="100">
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">
          {{ translate('ui.keywords.response') }}
        </span>
      </div>
      <input type="text" required class="form-control" v-model="response">
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">
          {{ translate('ui.keywords.cooldown') }}
        </span>
      </div>
     <input ype="number" required class="form-control" v-model="cooldown">
      <div class="input-group-append">
       <span class="input-group-text" id="inputGroup-sizing-default">{{ translate('ui.abbrs.seconds') }}</span>
      </div>
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">
          {{ translate('ui.keywords.visible') }}
        </span>
      </div>
     
      <div class="input-group-append">
        <button type="submit" class="btn" v-bind:class="{ 'btn-success': visible, 'btn-danger': !visible }" @click="visible = !visible">
          <span v-show="visible">Visible</span>
          <span v-show="!visible">Not visible</span>
        </button>
      </div>
    </div>
    <br>
    <button type="button" class="btn btn-block btn-success" @click="create">
      {{ translate('ui.create') }}
    </button>
    <br>
    <variables></variables>
  </div>
</template>

<script>

export default {
  data: function() {
    return {
      name: null,
      response: null,
      visible: true,
      cooldown: 5
    };
  },
  watch: {
    name(newVal) {
      let re = /[a-z]\d/gi;
      this.$set(this, "name", newVal.replace(/[^a-z-а-я-0-9 ]+/gi, "").toLowerCase());
    }
  },
  methods: {
    create() {
      if (!this.name || !this.response) return
      if (this.name.length > 100) return alert('Stop trying to hack me')
      
      let data = this.$data
      this.$socket.emit("create.keyword", { ...data }, async (err, data) => {
        if (err) return alert(err)

        this.$router.push("/keywords")
      })
    }
  }
};
</script>


<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

