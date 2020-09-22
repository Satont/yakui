<template>
  <Layout>
    <div class="event-info">
      <div class="event-nickname">vinsentovangogo</div>
      <div class="event-type">
        <div class="event">Raid with <span style="color: #fff">100 viewers</span> •</div>
        <div class="event-date">Yesterday, 19:30</div>
      </div>
    </div>
    <div class="event-icon"><RaidIcon /></div>
  </Layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Layout from './Layout.vue'
import RaidIcon from '../../assets/icons/Raid.svg'

@Component({
  components: {
    Layout,
    RaidIcon,
  },
})
export default class Raid extends Vue {}
</script>

<style></style>
