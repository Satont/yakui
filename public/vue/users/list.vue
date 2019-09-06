<template>
<div>
<b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center" v-on:input="changePage"></b-pagination>

<b-table id="table" striped hover primary-key dark :items="users" :fields="fields" @sort-changed="sort" no-local-sorting>
  <template slot="[index]" slot-scope="data">
    {{ data.index + 1 }}
  </template>
  <template slot="[username]" slot-scope="data">
    {{ data.item.username }}
  </template>
  <template slot="[messages]" slot-scope="data">
    <b-form-input size="sm" v-model="data.item.messages" v-bind:value="data.item.messages"></b-form-input>
  </template>
  <template slot="[watched]" slot-scope="data">
    <b-form-input size="sm" :value="data.value" @input="data.item.watched = $event"></b-form-input>
  </template>
  <template slot="[tips]" slot-scope="data">
    <b-form-input size="sm" v-model="data.item.tips" v-bind:value="data.item.tips"></b-form-input>
  </template>
  <template slot="[bits]" slot-scope="data">
     <b-form-input size="sm" v-model="data.item.bits" v-bind:value="data.item.bits"></b-form-input>
  </template>
  <template slot="[points]" slot-scope="data">
    <b-form-input size="sm" v-model="data.item.points" v-bind:value="data.item.points"></b-form-input>
  </template>
  <template slot="[actions]" slot-scope="data">
    <b-button-group size="sm">
      <b-button @click="saveUser(data.item)" variant="success"><i class="fas fa-save"></i></b-button>
      <b-button @click="deleteUser(data.index, data.item.id)" variant="danger"><i class="fas fa-trash"></i></b-button>
    </b-button-group>
  </template>
</b-table>

<b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center" v-on:input="changePage"></b-pagination>
</div>
</template>

<script>
import { findIndex, remove } from 'lodash'
import * as humanizeDuration from 'humanize-duration'

export default {
  data() {
    return {
      sortDesc: false,
      sortyBy: 'username',
      perPage: 30,
      currentPage: 1,
      totalRows: 0,
      users: [],
      fields: [
        { key: 'index', label: '#', tdClass: 'indexes' },
        { key: 'username', sortable: true },
        { key: 'messages', sortable: true },
        { key: 'watched', sortable: true, label: 'Watched (hours)', formatter: value => { return String(this.watchedHours(value)) } },
        { key: 'tips', sortable: true },
        { key: 'bits', sortable: true },
        { key: 'points', sortable: true },
        { key: 'actions', sortable: false, label: 'Actions' }
        ],
    }
  },
  mounted() {
    this.$socket.emit('users.count', null, (err, data) => {
      this.totalRows = data
    })
    this.$socket.emit('users.get', { sortBy: this.sortyBy, sortDesc: this.sortDesc, page: this.currentPage, perPage: this.perPage }, (err, data) => {
      this.users = data
    })
  },
  methods: {
    sort: function(o) {
      this.sortDesc = o.sortDesc
      this.sortyBy = o.sortBy
      this.currentPage = 1
      this.$socket.emit('users.get', { sortBy: o.sortBy, sortDesc: o.sortDesc, page: 1, perPage: this.perPage }, (err, data) => {
        this.users = data
      })
    },
    changePage: function(page) {
      this.$socket.emit('users.get', { sortBy: this.sortyBy, sortDesc: this.sortDesc, page: this.currentPage, perPage: this.perPage }, (err, data) => {
        this.users = data
      })
    },
    saveUser: function(data) {
      const user = {
        id: data.id,
        messages: Number(data.messages),
        bits: Number(data.bits),
        tips: Number(data.tips),
        points: Number(data.points),
        watched: Number(data.watched) * 60 * 60 * 1000,
      }
      this.$socket.emit('users.update.user', user, (err, data) => {})
    },
    deleteUser: function(index, id) {
      this.$socket.emit('users.delete.user', id, (err, data) => {})
      this.users.splice(index, 1)
    },
    watchedHours: function(time) {
      const minutes = Number(time) / (1 * 60 * 1000)
      const hours = (minutes / 60).toFixed(1)
      return hours
    }
  },
}
</script>

<style>
#pills-tab li {
  cursor: pointer;
}
.editing {
  display: inline-block;
}
.indexes {
  width:20px;
}
</style>