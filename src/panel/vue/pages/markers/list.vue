<template>
  <div>
    <h1>Markers list</h1>
    <b-table striped hover borderless dark :items="markers" :fields="fields">
      <template v-slot:cell(date)="data">
        {{ data.value }}
      </template>

      <template v-slot:cell(preview)="data">
        <span v-html="data.value"></span>
      </template>

      <template v-slot:cell(url)="data">
        <b-button size="sm" :href="data.value" target="_blank">Check</b-button>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import Timer from '@bot/models/Timer'
import axios from 'axios'
import { MarkerInList } from '../../../../../typings'

@Component
export default class TimersManagerList extends Vue {
  markers: MarkerInList[] = []
  fields = [
    { key: 'date', label: 'Data' },
    'preview',
    'description',
    'url',
  ]

  async created() {
    const { data } = await axios.get('/api/v1/markers', { headers: {
      'x-twitch-token': localStorage.getItem('accessToken')
    }})
    this.markers = data
  }
}
</script>

<style scoped>
.btn {
  opacity: 1 !important;
}
</style>
