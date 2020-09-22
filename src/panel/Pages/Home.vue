<template>
  <b-row class="justify-content-md-center h-100" align-v="center">
    <b-col col lg="6" class=" my-auto ">
      <div class="placeholder" style="margin-top: 8em;">
        <Placeholder />
      </div>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Placeholder from '../assets/icons/Placeholder.svg'

@Component({
  components: {
    Placeholder,
  },
})
export default class Home extends Vue {}
</script>
