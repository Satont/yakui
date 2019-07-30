<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Name</span>
      </div>
      <input
        type="text"
        class="form-control"
        placeholder="Name of command"
        v-model="name"
        maxlength="15"
      >
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Response</span>
      </div>
      <input
        type="text"
        required
        class="form-control"
        placeholder="Response of command"
        v-model="response"
      >
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Cooldown</span>
      </div>
      <input
        type="number"
        required
        class="form-control"
        v-model="cooldown"
      >
      <div class="input-group-append">
        <span class="input-group-text" id="inputGroup-sizing-default">seconds</span>
      </div>
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <label class="input-group-text" for="inputGroupSelect01">Type of cooldown</label>
      </div>
      <select class="custom-select" v-model="cooldowntype">
        <option value="notstop">Execute</option>
        <option value="stop">No execute</option>
      </select>
      <div class="input-group-append">
        <button class="btn btn-info" type="button" data-toggle="modal" data-target="#cooldowntypeinfo">?</button>
      </div>
    </div>
    <label class="typo__label">Command aliases</label>
    <multiselect v-model="aliases" tag-placeholder="Add" placeholder="Aliases" :options="options" :multiple="true" :taggable="true" @tag="addAliase">
      <template slot="noOptions">Write name</template>
    </multiselect>
    <br>
    <button type="button" class="btn btn-block btn-success" @click="create">Create</button>
    <br>
    <variables></variables>
    <cooldownModal id="cooldowntypeinfo"></cooldownModal>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  components: { Multiselect },
  data: function() {
    return {
      name: null,
      response: null,
      cooldown: 5,
      cooldowntype: 'notstop',
      aliases: [],
      options: []
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
      if (!this.name || !this.response || !this.cooldown || !this.cooldowntype) return
      if (this.name.length > 15) return alert('Stop trying to hack me')
      if (this.cooldowntype !== 'notstop' && this.cooldowntype !== 'stop') return alert('Stop trying to hack me')
      let data = this.$data
      delete data.options
      this.$socket.emit("create.command", { ...data })
      this.$router.push("/commands")
    },
    addAliase (newAliase) {
      if (newAliase.length > 15) return
      this.aliases.push(newAliase)
    }
  }
};
</script>


<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

