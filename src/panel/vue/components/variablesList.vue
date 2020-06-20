<template>
  <div>
     <b-button variant="info" size="sm" v-b-modal.variaibles>variables</b-button>

     <b-modal id="variaibles" scrollable size="lg" header-text-variant="dark" title="List of variables">
       <b-table striped hover borderless sticky-header="" :items="variables"></b-table>

       <template v-slot:modal-footer="{ cancel }">
          <b-button size="sm" variant="danger" @click="cancel()">
            Close
          </b-button>
       </template>
     </b-modal>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'

@Component
export default class NavBar extends Vue {
  variables = []
  fields: [
    { key: 'name', label: 'Name' },
    { key: 'response', response: 'Response' }
  ]

  async created() {
    const { data } = await axios.get('/api/v1/variables/all', {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      }
    })
    this.variables = data
  }
}
</script>
