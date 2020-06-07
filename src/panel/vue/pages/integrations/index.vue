<template>
  <div>
    <b-card bg-variant="dark" text-variant="white" title="Card Title" no-body>
      <b-card-header header-tag="nav">
        <b-nav card-header pills>
          <b-nav-item to="/integrations">DonationAlerts</b-nav-item>
          <b-nav-item to="/integrations/spotify">Spotify</b-nav-item>
        </b-nav>
      </b-card-header>

      <b-card-body class="text-center">
        <router-view></router-view>
      </b-card-body>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'

@Component
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