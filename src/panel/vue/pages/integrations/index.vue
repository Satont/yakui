<template>
  <b-tabs content-class="mt-3" align="center">
    <b-tab title="DonationAlerts" active><DonationAlerts /></b-tab>
  </b-tabs>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'
import DonationAlerts from './donationalerts.vue'

@Component({
  components: {
    DonationAlerts,
  }
})
export default class Index extends Vue {

}
</script>