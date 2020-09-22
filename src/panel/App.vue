<template>
  <div id="wrapper">
    <Header />
    <Sidebar />
    <Section>
      <transition name="fade" mode="out-in">
        <router-view />
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

@Component({
  name: 'wrapper',
  components: {
    Section,
    Footer,
    Header,
    Sidebar,
  },
})
export default class App extends Vue {}
</script>
