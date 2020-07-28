<template>
<b-card style="color:#000" class="h-100" body-class="p-0 h-100" header-class="p-1">
  <template v-slot:header>
    <span class="title">{{ title | capitalize }}</span> <b-btn variant="danger" size="sm" class="float-right">Delete</b-btn>
  </template>
  <b-card-body class="p-0 h-100">
    <slot />
  </b-card-body>
</b-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  props: {
    title: String,
  },
  filters: {
    capitalize: (v) => {
      return v.toUpperCase()
    }
  }
})
export default class Interface extends Vue {

}
</script>
<style scoped>
.title {
  font-weight: bold;
}
</style>
