<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="inputGroup-sizing-default">Name</span>
      </div>
      <input type="text" class="form-control" v-model="name" maxlength="15">
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
    <label class="typo__label">Aliases for command</label>
    <multiselect v-model="aliases" tag-placeholder="Add" placeholder="Aliases"  :options="options" :multiple="true" :taggable="true" @tag="addAliase">
      <template slot="noOptions">Write name</template>
    </multiselect>
    <br>
    <button type="button" class="btn btn-block btn-success" @click="create">Edit</button>
    <button type="button" class="btn btn-block btn-danger" @click="del()">delete</button>
    <br>
    <variables></variables>
    <cooldownModal id="cooldowntypeinfo"></cooldownModal>
</div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import { random } from 'lodash'

export default {
  components: { Multiselect },
  data: function() {
    return {
      id: this.$route.params.id,
      name: this.$route.params.name,
      response: this.$route.params.response,
      permission: this.$route.params.permission,
      cooldown: this.$route.params.cooldown || 5,
      cooldowntype: this.$route.params.cooldowntype,
      aliases: this.$route.params.aliases || [],
      options: [],
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
    del(command, index) {
      let currentname = window.location.href.split('/')
      this.$socket.emit('delete.command', currentname[currentname.length - 1])
      this.$router.push("/commands")
    },
    create() {
      if (!this.name || !this.response || !this.cooldown || !this.cooldowntype) return
      if (this.name.length > 15) return alert('Stop trying to hack me')
      if (this.cooldowntype !== 'notstop' && this.cooldowntype !== 'stop') return alert('Stop trying to hack me')
      if (this.permission !== 'broadcaster' && this.permission !== 'moderator' && this.permission !== 'vip' && this.permission !== 'subscriber' && this.permission !== 'viewer') return

      let data = this.$data
      delete data.options
      this.$socket.emit('update.command', { ...data }, async (err, data) => {
        if (err) return alert(err)

        this.$router.push("/commands")
      })
    },
    addAliase (newAliase) {
      this.aliases.push(newAliase)
    }
  },
  mounted() {
    if (!this.response) {
      this.$socket.emit("list.commands", {}, (err, list) => {
        let find = list.find(o => o.id === Number(this.id))
        if (!find) return this.$router.push('/commands')
        this.id = find.id
        this.name = find.name
        this.response = find.response
        this.cooldown = find.cooldown,
        this.permission = find.permission,
        this.cooldowntype = find.cooldowntype,
        this.aliases = find.aliases,
        this.visible = find.visible
      })
    }
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>