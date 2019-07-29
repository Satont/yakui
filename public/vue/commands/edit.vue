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
        <span class="input-group-text" id="inputGroup-sizing-default">Response</span>
      </div>
      <input type="text" class="form-control" v-model="response">
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
        <label class="input-group-text" for="inputGroupSelect01">Type of cooldowns</label>
      </div>
      <select class="custom-select" v-model="cooldowntype">
        <option value="notstop">Execute</option>
        <option value="stop">No execute</option>
      </select>
      <div class="input-group-append">
        <button class="btn btn-info" type="button" data-toggle="modal" data-target="#cooldowntypeinfo">?</button>
      </div>
    </div>
    <label class="typo__label">Aliases for command</label>
    <multiselect v-model="aliases" tag-placeholder="Add" placeholder="Aliases"  :options="options" :multiple="true" :taggable="true" @tag="addAliase">
      <template slot="noOptions">Write name</template>
    </multiselect>
    <br>
    <button type="button" class="btn btn-block btn-success" @click="create">Edit</button>
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
      name: this.$route.params.name,
      response: this.$route.params.response,
      cooldown: this.$route.params.cooldown || 5,
      cooldowntype: this.$route.params.cooldowntype,
      aliases: this.$route.params.aliases || [],
      options: []
    };
  },
  watch: {
    name(newVal) {
      let re = /[a-z]\d/gi;
      this.$set(this, "name", newVal.replace(/[^a-z]+/gi, "").toLowerCase());
    }
  },
  methods: {
    create() {
      let currentname = window.location.href.split('/')
      let data = this.$data
      delete data.options
      this.$socket.emit('update.command', { currentname: currentname[currentname.length - 1], ...data })
      this.$router.push("/commands")
      //if (!this.response)
    },
    addAliase (newAliase) {
      this.aliases.push(newAliase)
    }
  },
  mounted() {
    if (!this.response) {
      this.$socket.emit("list.commands", {}, (err, list) => {
        let find = list.find(o => o.name === this.name)
        this.name = find.name
        this.response = find.response
        this.cooldown = find.cooldown,
        this.cooldowntype = find.cooldowntype,
        this.aliases = find.aliases
      })
    }
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>