<template>
  <Layout>
    <div class="event-info">
      <div class="event-nickname">{{ username }}</div>
      <div class="event-type">
        <div class="event">Follow •</div>
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
export default class Follow extends Vue {
  @Prop(String) readonly username: string
  @Prop(Date) readonly date: string
}
</script>
