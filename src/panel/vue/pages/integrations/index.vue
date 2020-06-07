<template>
  <b-tabs content-class="mt-3" nav-class="sticky-top" pills vertical end>
    <b-tab title="DonationAlerts" title-link-class="text-white" active><DonationAlerts /></b-tab>
    <b-tab title="Spotify" title-link-class="text-white"><Spotify /></b-tab>
  </b-tabs>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'
import DonationAlerts from './donationalerts.vue'
import Spotify from './spotify.vue'

@Component({
  components: {
    DonationAlerts,
    Spotify,
  }
})
export default class Index extends Vue {

}
</script>


<style scoped>
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