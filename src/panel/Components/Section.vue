<template>
  <b-container fluid class="page-wrapper container-fix" v-bind:style="{ 'min-height': windowHeight }">
    <slot />
  </b-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Section extends Vue {
  windowHeight = window.innerHeight - 47 + 'px'

  mounted() {
    this.$nextTick(() => window.addEventListener('resize', this.onResize))
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  }
  
  onResize() {
    this.windowHeight = window.innerHeight - 47 + 'px'
  }
}
</script>

<style scoped>
.page-wrapper {
  position: relative !important;
  transition: all 0.5s;
}
</style>
