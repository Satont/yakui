<template>
  <div>
    <b-card bg-variant="dark" text-variant="white" title="Card Title" no-body>
      <b-card-header header-tag="nav">
        <b-nav card-header pills>
          <b-nav-item to="/settings">General</b-nav-item>
          <b-nav-item to="/settings/oauth">OAuth</b-nav-item>
          <b-nav-item to="/settings/moderation">Moderation</b-nav-item>
          <b-nav-item to="/settings/users">Users</b-nav-item>
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