<template>
  <Layout>
    <div class="event-info">
      <div class="event-nickname">{{ username }}</div>
      <div class="event-type">
        <div class="event">Subscribe <span style="color: #772ce8">{{ namedTier }} Tier</span> •</div>
        <div class="event-date">{{ date }}</div>
      </div>
    </div>
    <div class="event-icon"><SubIcon /></div>
  </Layout>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator'
import Layout from './Layout.vue'
import SubIcon from '../../assets/icons/Subscribe.svg'

@Component({
   components: {
    Layout,
    SubIcon,
  },
})
export default class Subscribe extends Vue {
  @Prop(String) readonly username: string
  @Prop(String) readonly date: string
  @Prop(Date) readonly tier: string

  get namedTier() {
    if (this.tier === '1') return '1st'
    else if (this.tier === '2') return '2nd'
    else return '3rd'
  }
}
</script>
