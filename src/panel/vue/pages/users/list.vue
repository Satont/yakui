<template>
  <div>
    <div class="title">
      <h1>Users list</h1>
      <b-pagination class="ml-auto" v-model="currentPage" size="sm" :total-rows="totalRows" :per-page="perPage" align="right" v-on:input="getUsers" last-number first-number></b-pagination>
      <b-form-input v-on:keyup="getUsers" class="ml-2" v-model="byUsername" type="text" size="sm" style="width:200px;" placeholder="Type to Search"></b-form-input>
    </div>

    <b-table id="table" striped hover primary-key dark :items="users" :fields="fields" @sort-changed="getUsers" no-local-sorting>
      <template v-slot:cell(index)="data">
        {{ data.index + 1 }}
      </template>

      <template v-slot:cell(username)="data">
        {{ data.value }}
      </template>

      <template v-slot:cell(messages)="data">
        {{ data.value }}
      </template>

       <template v-slot:cell(watched)="data">
         {{ data.value }}
      </template>

      <template v-slot:cell(tips)="data">
        {{ data.value }}
      </template>

      <template v-slot:cell(bits)="data">
        {{ data.value }}
      </template>

      <template v-slot:cell(actions)="data" v-if="$store.state.loggedUser.userType === 'admin' && !isPublic()">
      <b-button-group size="sm">
        <b-button @click="editUser(data.item)" variant="info"><i class="fas fa-pen"></i></b-button>
        <b-button @click="del(data.item.index, data.item.id)" variant="danger"><i class="fas fa-trash"></i></b-button>
      </b-button-group>
    </template>
  </b-table>

  </div>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { EnvChecker } from '../helpers/mixins'

import { User } from '@bot/entities/User'

@Component({
  mixins: [EnvChecker]
})
export default class UsersManagerList extends Mixins(EnvChecker) {
  users: User[] = []
  sortDesc = false
  sortyBy = 'username'
  page = 1
  perPage = 30
  currentPage = 1
  totalRows = 0
  byUsername = ''
  fields = [
    { key: 'index', label: '#', tdClass: 'indexes' },
    { key: 'username', sortable: true },
    { key: 'messages', sortable: true },
    { key: 'watched', sortable: true, label: 'Watched (hours)', formatter: value => this.watchedHours(value) },
    { key: 'totalTips', sortable: false, label: 'tips' },
    { key: 'totalBits', sortable: false, label: 'bits' },
    { key: 'points', sortable: true },
  ]

  created() {
    this.getUsers()

    if (!this.isPublic()) {
      this.fields.push({ key: 'actions', sortable: false, label: 'Actions' })
    }
  }

  async editUser(params) {
    await this.$router.push({ name: 'UsersManagerEdit', params })
  }

  async del(id, index) {
    await this.$axios.delete('/users', {
      data: { id },
    })
    this.users.splice(index, 1)
  }

  async getUsers(o?) {
    this.sortyBy = o?.sortBy ?? this.sortyBy
    this.sortDesc = o?.sortDesc ?? this.sortDesc
    this.currentPage = o?.currentPage ?? this.currentPage

    const { data } = await this.$axios.get('/users', {
      params: {
        sortBy: this.sortyBy,
        sortDesc: this.sortDesc,
        page: this.currentPage,
        perPage: this.perPage,
        byUsername: this.byUsername,
      }
    })

    this.users = data.users
    this.totalRows = data.total
  }

  watchedHours(time) {
    const minutes = Number(time) / (1 * 60 * 1000)
    const hours = (minutes / 60).toFixed(1)
    return `${hours}h`
  }

}
</script>

<style scoped>
.btn {
  opacity: 1 !important;
}
.title {
  display: flex; justify-content: space-between;
}
</style>
