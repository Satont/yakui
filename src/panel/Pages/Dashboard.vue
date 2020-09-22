<template>
  <b-row>
    <b-col sm="4"><Chat /></b-col>
    <b-col sm="4"><Stream /></b-col>
    <b-col sm="4"><Events /></b-col>
  </b-row>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Chat from '../Widgets/Chat.vue'
import Events from '../Widgets/Events.vue'
import Stream from '../Widgets/Stream.vue'

@Component({
  name: 'Dashboard',
  components: {
    Chat,
    Stream,
    Events,
  },
})
export default class Dashboard extends Vue {}
</script>

<style></style>
