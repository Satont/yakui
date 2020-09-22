<template>
  <Layout>
    <div class="event-info">
      <div class="event-nickname">vinsentovangogo</div>
      <div class="event-type">
        <div class="event">Subscribe <span style="color: #772ce8">1st Tier</span> •</div>
        <div class="event-date">Yesterday, 19:30</div>
      </div>
    </div>
    <div class="event-icon"><SubIcon /></div>
  </Layout>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator'
import Layout from './Layout.vue'
import SubIcon from '../../assets/icons/Subscribe.svg'

@Component({
   components: {
    Layout,
    SubIcon,
  },
})
export default class Subscribe extends Vue {}
</script>
