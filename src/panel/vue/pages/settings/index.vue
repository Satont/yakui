<template>
  <b-tabs content-class="mt-3" align="center">
    <b-tab title="General" active><General /></b-tab>
    <b-tab title="OAuth" lazy><OAuth /></b-tab>
    <b-tab title="Moderation" lazy><Moderation /></b-tab>
  </b-tabs>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'
import OAuth from './oauth.vue'
import Moderation from './moderation.vue'
import General from './general.vue'

@Component({
  components: {
    OAuth,
    Moderation,
    General
  }
})
export default class Index extends Vue {

}
</script>