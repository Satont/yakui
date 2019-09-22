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
    <div class="form-group">
      <label for="exampleFormControlTextarea1">Response</label>
      <textarea type="text" class="form-control" v-model="response" rows="2"></textarea>
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <label class="input-group-text" for="inputGroupSelect01">Permission</label>
      </div>
      <select class="custom-select" v-model="permission">
        <option value="broadcaster">Broadcaster</option>
        <option value="moderator">Moderators</option>
        <option value="vip">Vips</option>
        <option value="subscriber">Subscribers</option>
        <option value="viewer">Viewers</option>
      </select>
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Command description</span>
      </div>
      <input type="text" class="form-control" placeholder="description of command" v-model="description">
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Cooldown</span>
      </div>
      <input
        type="number"
        required
        class="form-control"
        v-model.number="cooldown"
      >
      <div class="input-group-append">
        <span class="input-group-text" id="inputGroup-sizing-default">seconds</span>
      </div>
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <label class="input-group-text" for="inputGroupSelect01">Cooldown for</label>
      </div>
      <select class="custom-select" v-model="cooldownfor">
        <option value="global">Global</option>
        <option value="user">Per user</option>
      </select>
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
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Visible in $commands variable</span>
      </div>
     
      <div class="input-group-append">
        <button type="submit" class="btn" v-bind:class="{ 'btn-success': visible, 'btn-danger': !visible }" @click="visible = !visible">
          <span v-show="visible">Visible</span>
          <span v-show="!visible">Not visible</span>
        </button>
      </div>
    </div>
    <label class="typo__label">Command aliases</label>
    <div class="input-group mb-3" v-for="(aliase, index) in aliases" :key="index">
      <input
        type="text"
        required
        class="form-control"
        placeholder="Text"
        v-model="aliases[index]"
      >
      <div class="input-group-append">
        <button type="button" class="btn btn-danger" @click="deleteAliase(index)">Delete</button>
      </div>
    </div>
    <button type="button" class="btn btn-block btn-success" @click="createAliase">+</button>
    <br>
    <button type="button" class="btn btn-block btn-success" @click="create">Create</button>
    <br>
    <variables></variables>
    <cooldownModal id="cooldowntypeinfo"></cooldownModal>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      name: null,
      response: null,
      permission: 'viewer',
      description: 'This command have not description',
      cooldown: 5,
      cooldowntype: 'notstop',
      cooldownfor: 'global',
      aliases: [],
      options: [],
      visible: true
    };
  },
  watch: {
    name(newVal) {
      let re = /[a-z]\d/gi;
      this.$set(this, "name", newVal.replace(/[^a-z-а-я-0-9 ]+/gi, "").toLowerCase());
    }
  },
  methods: {
    createAliase() {
      this.aliases.push("");
    },
    deleteAliase(index) {
      this.aliases.splice(index, 1);
    },
    create() {
      if (!this.name || !this.response || !this.cooldown || !this.cooldowntype) return
      if (this.name.length > 15) return alert('Stop trying to hack me')
      if (this.cooldowntype !== 'notstop' && this.cooldowntype !== 'stop') return alert('Stop trying to hack me')
      if (this.permission !== 'broadcaster' && this.permission !== 'moderator' && this.permission !== 'vip' && this.permission !== 'subscriber' && this.permission !== 'viewer') return
      if (this.aliases.some(o => !o.length)) return alert('Some of your aliases is empty. Delete them first.')
      let data = this.$data
      delete data.options
      this.$socket.emit("create.command", { ...data }, async (err, data) => {
        if (err) return alert(err)

        this.$router.push("/commands")
      })
    },
    addAliase (newAliase) {
      if (newAliase.length > 15) return
      this.aliases.push(newAliase)
    }
  }
};
</script>


<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

