<template>
  <div id="wrapper">
    <Header />
    <Sidebar />
    <Section>
      <transition name="fade" mode="out-in">
        <Dashboard :style="dashboardVisibility" />
      </transition>
      <transition name="fade" mode="out-in">
        <router-view :style="routerViewVisibility" />
      </transition>
    <Footer />
    </Section>
  </div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator'

import Section from './Components/Section.vue'
import Footer from './Components/Footer.vue'
import Header from './Components/Header.vue'
import Sidebar from './Components/Sidebar.vue'
import Dashboard from './Pages/Dashboard.vue'

@Component({
  name: 'wrapper',
  components: {
    Section,
    Footer,
    Header,
    Sidebar,
    Dashboard,
  },
})
export default class App extends Vue {
  get isDashboardOpened() {
    return this.$route.path === '/'
  }

  get routerViewVisibility() {
    return { visibility: !this.isDashboardOpened ? 'visible' : 'hidden' }
  }

  get dashboardVisibility() {
    return { visibility: this.isDashboardOpened ? 'visible' : 'hidden' }
  }
}
</script>
