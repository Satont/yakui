<template>
<div>
<b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center" v-on:input="changePage"></b-pagination>

<b-table id="table" striped hover primary-key dark :items="users" :fields="fields" @sort-changed="sort" no-local-sorting>
  <template v-slot:cell(index)="data">
    {{ data.index + 1 }}
  </template>
  <template v-slot:cell(username)="data">
    {{ data.value }}
  </template>
  <template v-slot:cell(messages)="data">
    <b-form-input size="sm" v-model="data.item.messages" :value="data.value"></b-form-input>
  </template>
  <template v-slot:cell(watched)="data">
    <b-form-input size="sm" @input="data.item.watched = $event" :value="data.value"></b-form-input>
  </template>
  <template v-slot:cell(tips)="data">
    <b-form-input size="sm" v-model="data.item.tips" :value="data.value"></b-form-input>
  </template>
  <template v-slot:cell(bits)="data">
     <b-form-input size="sm" v-model="data.item.bits" :value="data.value"></b-form-input>
  </template>
  <template v-slot:cell(points)="data">
    <b-form-input size="sm" v-model="data.item.points" :value="data.value"></b-form-input>
  </template>
  <template v-slot:cell(actions)="data">
    <b-button-group size="sm">
      <b-button @click="saveUser(data.item)" variant="success"><i class="fas fa-save"></i></b-button>
      <b-button @click="deleteUser(data.item.index, data.item.id)" variant="danger"><i class="fas fa-trash"></i></b-button>
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