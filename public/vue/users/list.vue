<template>
<div>
<b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center" v-on:input="changePage"></b-pagination>

<b-table striped hover primary-key dark fixed :items="users" :fields="fields" @sort-changed="sort" no-local-sorting>
  <template slot="[index]" slot-scope="data">
        {{ data.index + 1 }}
  </template>
</b-table>

<b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center" v-on:input="changePage"></b-pagination>
</div>
</template>

<script>
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
        { key: 'index', label: '#' },
        { key: 'username', sortable: true },
        { key: 'messages', sortable: true },
        { key: 'points', sortable: true },
        { key: 'watched', sortable: true },
        { key: 'bits', sortable: true },
        { key: 'tips', sortable: true },
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
    }
  }
}
</script>

<style>
#pills-tab li {
  cursor: pointer;
}
</style>