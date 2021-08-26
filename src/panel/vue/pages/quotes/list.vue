<template>
  <div>
    <h1>Quotes list</h1>
    <p class="pb-2" v-if="!isPublic() && hasAccess()">
      <b-button class="btn-block" variant="primary" size="sm" @click="edit">New quote</b-button>
    </p>

    <b-table striped hover borderless dark :items="quotes" :fields="fields">
      <template v-slot:cell(text)="data">
        <span v-html="data.value"></span>
      </template>

      <template v-slot:cell(used)="data">
        {{ data.value }} times
      </template>

      <template v-slot:cell(actions)="row" v-if="hasAccess()">
         <b-button-group size="sm">
          <b-button variant="primary" @click="edit(row.item)">Edit</b-button>
          <b-button variant="danger" @click="del(row.item)">Delete</b-button>
        </b-button-group>
      </template>

    </b-table>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import { EnvChecker } from '../helpers/mixins'
import { Quotes } from '@prisma/client'

@Component
export default class QuotesManagerList extends EnvChecker {
  quotes: Quotes[] = []
  fields = [
    { key: 'id', label: 'ID' },
    { key: 'text', label: 'Text' },
    { key: 'used', label: 'Used' },
    { key: 'actions' },
  ]

  async created() {
    const quotes = await this.$axios.get('/quotes');

    this.quotes = quotes.data
  }

  hasAccess() {
    return this.$store.state.loggedUser?.userType === 'admin' && !this.isPublic()
  }

  async edit(params: any) {
    await this.$router.push({ name: 'QuotesManagerEdit', params })
  }

  async del(item: Quotes) {
    const index = this.quotes.indexOf(item)
    await this.$axios.delete('/quotes', {
      data: { id: item.id }
    })
    this.quotes.splice(index, 1)
    this.$toast.success('Success')
  }
}
</script>