<template>
  <b-tabs content-class="mt-3" nav-class="sticky-top" pills vertical end>
    <b-tab title="General" title-link-class="text-white" active><General /></b-tab>
    <b-tab title="OAuth" title-link-class="text-white" lazy><OAuth /></b-tab>
    <b-tab title="Moderation" title-link-class="text-white" lazy><Moderation /></b-tab>
    <b-tab title="Users" title-link-class="text-white" lazy><Users /></b-tab>
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

<style>
.nav-link {
  color: #fff !important;
}
.nav-link, .nav-link:hover, .nav-link:focus {
  color: #fff !important;
}
.sticky-top {
  top: 30px !important;
}
</style>