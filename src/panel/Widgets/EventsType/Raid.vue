<template>
  <Layout>
    <div class="event-info">
      <div class="event-nickname">{{ username }}</div>
      <div class="event-type">
        <div class="event">Raid with <span style="color: #fff">{{ viewers }} viewers</span> •</div>
        <div class="event-date">{{ date }}</div>
      </div>
    </div>
    <div class="event-icon"><RaidIcon /></div>
  </Layout>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Layout from './Layout.vue'
import RaidIcon from '../../assets/icons/Raid.svg'

@Component({
  components: {
    Layout,
    RaidIcon,
  },
})
export default class Raid extends Vue {
  @Prop(String) readonly username: string
  @Prop(String) readonly date: string
  @Prop(Number) readonly viewers: number
}
</script>

<style></style>
