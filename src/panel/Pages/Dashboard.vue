<template>
  <div>
    <b-row class="justify-content-md-center h-100" align-v="center" v-if="!widgets.length">
      <b-col col lg="6" class="my-auto ">
        <div class="placeholder" style="margin-top: 8em;">
          <Placeholder />
        </div>
      </b-col>
    </b-row>

    <b-row v-else>
      <b-col sm="4"><Chat /></b-col>
      <b-col sm="4"><Stream /></b-col>
      <b-col sm="4"><Events /></b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Chat from '../Widgets/Chat.vue'
import Events from '../Widgets/Events.vue'
import Stream from '../Widgets/Stream.vue'
import Placeholder from '../assets/icons/Placeholder.svg'

@Component({
  name: 'Dashboard',
  components: {
    Chat,
    Stream,
    Events,
    Placeholder,
  },
})
export default class Dashboard extends Vue {
  widgets = ['1']
}
</script>

<style></style>
