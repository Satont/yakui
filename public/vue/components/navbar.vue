<template>
  <div>
    <b-navbar toggleable="lg" type="light" variant="dark" sticky="top" class="flex-md-nowrap p-0 shadow">
    <b-navbar-brand class="navbar-brand col-md-3 col-lg-2 mr-0 px-3" href="#">{{ title }}</b-navbar-brand>
  </b-navbar>
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
.shadow {
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
.navbar-brand {
  padding-top: .75rem;
  padding-bottom: .75rem;
  font-size: 1rem;
  background-color: rgba(0, 0, 0, .25);
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, .25);
  color: #fff;
}

.navbar .navbar-toggler {
  top: .25rem;
  right: 1rem;
}

.navbar .form-control {
  padding: .75rem 1rem;
  border-width: 0;
  border-radius: 0;
}
</style>