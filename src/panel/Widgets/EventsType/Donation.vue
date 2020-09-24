<template>
  <Layout>
    <div class="event-info">
      <div class="event-nickname">{{ username }}</div>
      <div class="event-type">
        <div class="event">
          Donate with <span style="color: #F57D07">{{ service }} </span>the amount of
          <span style="color: #fff">{{ amount }} {{ currency }}</span> •
        </div>
        <div class="event-date">{{ date }}</div>
      </div>
    </div>
    <div class="event-icon"><FollowIcon /></div>
  </Layout>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Layout from './Layout.vue'
import FollowIcon from '../../assets/icons/Follow.svg'

@Component({
  components: {
    Layout,
    FollowIcon,
  },
})
export default class Donation extends Vue {
  @Prop(String) readonly username: string
  @Prop(String) readonly date: string
  @Prop(String) readonly service: string
  @Prop(Number) readonly amount: number
  @Prop(String) readonly currency: string
  @Prop(String) readonly message: string
}
</script>
