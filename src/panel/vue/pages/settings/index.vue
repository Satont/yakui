<template>
  <b-tabs content-class="mt-3" align="center">
    <b-tab title="General" active><General /></b-tab>
    <b-tab title="OAuth" lazy><OAuth /></b-tab>
    <b-tab title="Moderation" lazy><Moderation /></b-tab>
    <b-tab title="Users" lazy><Users /></b-tab>
  </b-tabs>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'
import OAuth from './oauth.vue'
import Moderation from './moderation.vue'
import General from './general.vue'
import Users from './users.vue'

@Component({
  components: {
    OAuth,
    Moderation,
    General,
    Users
  }
})
export default class Index extends Vue {

}
</script>