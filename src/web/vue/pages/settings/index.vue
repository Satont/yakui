<template>
  <b-tabs content-class="mt-3" align="center">
    <b-tab title="OAuth" active><OAuth /></b-tab>
    <b-tab title="Moderation"><Moderation /></b-tab>
  </b-tabs>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'
import OAuth from './oauth.vue'
import Moderation from './moderation.vue'

@Component({
  components: {
    OAuth,
    Moderation
  }
})
export default class Index extends Vue {

}
</script>