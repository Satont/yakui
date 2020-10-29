<template>
  <div class="event-block">
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Layout extends Vue {}
</script>

<style>
.event-block {
  display: flex;
  height: 63px;
  align-items: center;
  padding-right: 16px;
  padding-left: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
