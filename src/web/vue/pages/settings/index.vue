<template>
  <b-tabs content-class="mt-3" align="center">
    <b-tab title="OAuth" active><OAuth /></b-tab>
  </b-tabs>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'
import OAuth from './oauth.vue'

@Component({
  components: {
    OAuth
  }
})
export default class Index extends Vue {

}
</script>