<template>
<b-card style="color:#000" class="h-100" body-class="p-0 h-100">
  <template v-slot:header class="p-0">
    <h6 class="mb-0">{{ title | capitalize }}</h6>
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
