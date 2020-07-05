<template>
  <div>
  <b-nav vertical class="col-md-1 col-lg-1 d-md-block bg-dark sidebar collapse" active-class="router-link-active">
    <b-nav-item router-link to="/" exact><i class="fas fa-home"></i> Home</b-nav-item>
    <b-nav-item router-link to="/events"><i class="fas fa-calendar-alt"></i> Events</b-nav-item>
    <b-nav-item router-link to="/integrations"><i class="fas fa-hands-helping"></i> Integrations</b-nav-item>
    <b-nav-item router-link to="/settings"><i class="fas fa-cogs"></i> Settings</b-nav-item>
    <b-nav-item router-link to="/commands"><i class="fas fa-bars"></i> Commands</b-nav-item>
    <b-nav-item router-link to="/timers"><i class="fas fa-history"></i> Timers</b-nav-item>
    <b-nav-item router-link to="/users"><i class="fas fa-users"></i> Users</b-nav-item>
    <b-nav-item router-link to="/keywords"><i class="far fa-keyboard"></i> Keywords</b-nav-item>
    <b-nav-item outer-link to="/variables"><i class="fas fa-superscript"></i> Variables</b-nav-item>
    <b-nav-item outer-link to="/greetings"><i class="far fa-hand-spock"></i> Greetings</b-nav-item>
    <b-nav-item outer-link to="/markers"><i class="fas fa-thumbtack"></i> Markers</b-nav-item>
    <b-nav-item outer-link to="/overlays"><i class="fas fa-file-alt"></i> Overlays</b-nav-item>
  </b-nav>
</div>

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class NavBar extends Vue {
  title = 'Navbar'
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 48px 0 0;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);
}

@media (max-width: 767.98px) {
  .sidebar {
    top: 5rem;
  }
}

.sidebar-sticky {
  position: relative;
  top: 0;
  height: calc(100vh - 48px);
  padding-top: .5rem;
  overflow-x: hidden;
  overflow-y: auto;
}

@supports ((position: -webkit-sticky) or (position: sticky)) {
  .sidebar-sticky {
    position: -webkit-sticky;
    position: sticky;
  }
}

.sidebar .nav-link {
  font-weight: 500;
  color: #fff;
  text-align: center;
}

.sidebar > .nav-item > .nav-link i {
  display: block;
}

.sidebar .nav-link .feather {
  margin-right: 4px;
  color: #999;
}

.sidebar .nav-link.router-link-exact-active, .nav-link.router-link-active {
  color: #fff;
  background: rgba(94, 123, 154, 0.25);
}

.sidebar .nav-link:hover .feather,
.sidebar .nav-link.active .feather {
  color: inherit;
}

.sidebar-heading {
  font-size: .75rem;
  text-transform: uppercase;
}
</style>
