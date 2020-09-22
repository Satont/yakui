<template>
  <Layout>
    <div class="event-info">
      <div class="event-nickname">vinsentovangogo</div>
      <div class="event-type">
        <div class="event">Follow •</div>
        <div class="event-date">Yesterday, 19:30</div>
      </div>
    </div>
    <div class="event-icon"><FollowIcon /></div>
  </Layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Layout from './Layout.vue'
import FollowIcon from '../../assets/icons/Follow.svg'

@Component({
  components: {
    Layout,
    FollowIcon,
  },
})
export default class Follow extends Vue {}
</script>
