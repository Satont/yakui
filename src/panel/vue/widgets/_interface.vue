<template>
<b-card style="color:#000" class="h-100" body-class="p-0 h-100" header-class="p-1">
  <template v-slot:header>
    <span class="title">{{ title | capitalize }}</span> <b-btn variant="danger" size="sm" class="float-right" @click="del(id)">Delete</b-btn><b-btn variant="info" size="sm" class="float-right" >Drug</b-btn>
  </template>
  <b-card-body class="p-0 h-100">
    <slot />
  </b-card-body>
</b-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'

@Component({
  props: {
    title: String,
    id: Number,
  },
  filters: {
    capitalize: (v) => {
      return v.toUpperCase()
    }
  }
})
export default class Interface extends Vue {
  async del(id) {
    await axios.delete('/api/v1/widgets', {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      },
      data: {
        id: this.$props.id
      }
    })
  }
}
</script>
<style scoped>
.title {
  font-weight: bold;
}
</style>
