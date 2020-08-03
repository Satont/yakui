<template>
<div class="dashboard">
  <b-btn variant="success" block class="mb-1" v-b-modal.widgets>Add new widget</b-btn>
    <grid-layout
      :layout="widgets"
      :col-num="12"
      :row-height="38"
      :is-draggable="true"
      :is-resizable="true"
      :is-mirrored="false"
      :vertical-compact="false"
      :margin="[10, 10]"
      :use-css-transforms="true">
        <grid-item v-for="item in widgets" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i" :key="item.i" @resized="saveWidget" @moved="saveWidget">
          <b-card style="color:#000" class="h-100" body-class="p-0 h-100" header-class="p-1">
            <template v-slot:header>
              <span class="title">{{ item.name | capitalize }}</span> <b-btn variant="danger" size="sm" class="float-right" @click="delWidget(item.id)">Delete</b-btn> <i class="fas fa-info-circle" v-b-tooltip.hover :title="descriptions[item.name]"></i>
            </template>
            <b-card-body class="p-0 h-100">
              <component :is="item.name" :id="item.id" />
            </b-card-body>
          </b-card>
        </grid-item>
    </grid-layout>

  <b-modal id="widgets" header-text-variant="dark" body-text-variant="dark" title="Choose widget" scrollable size="sm">
    <b-list-group>
      <div class="alert alert-info" v-show="!availableWidgets.length">There is no available widgets.</div>
      <b-list-group-item href="#" @click="addWidget(widget)" v-for="widget in availableWidgets" :key="widget">{{ widget | capitalize }}</b-list-group-item>
    </b-list-group>
  </b-modal>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import VueGridLayout  from 'vue-grid-layout'
import Widget from '../../../../bot/models/Widget'

@Component({
  components: {
    VueGridLayout,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    chat: () => import('../../widgets/chat.vue'),
    stream: () => import('../../widgets/stream.vue'),
    eventlist: () => import('../../widgets/eventlist.vue')
  },
  filters: {
    capitalize: (v) => v.toUpperCase()
  }
})
export default class Interface extends Vue {
  available = ['chat', 'stream', 'eventlist']
  title = 'Some Widget'
  widgets: { name: string, x: number, y: number, h: number, w: number, i: number, id: number }[] = []
  descriptions = {
    chat: 'Just embeded twitch chat.',
    stream: 'Just embeded twitch stream monitor.',
    eventlist: 'Showing latest events: follows, tips, subscribers, re-subscribers, raidings, hostings. This list updates itself.',
  }

  async saveWidget(index) {
    const widget = this.widgets[index]

    const { data } = await this.$axios.post('/widgets', widget)

    return data
  }

  created() {
    this.getWidgets()
  }

  async getWidgets() {
    const request = await this.$axios.get('/widgets')

    const widgets: Widget[] = request.data
    this.widgets = widgets.reduce((array, widget, index) => {
      array.push({ ...widget, i: index, })
      return array
    }, [])
  }

  get availableWidgets() {
    return this.available.filter(o => !this.widgets.some(w => w.name === o))
  }

  async addWidget(name) {
    let y = 0
    for (const w of this.widgets) y = Math.max(y, w.y + w.h)
    const object = { x: 0, y, h: 9, w: 4, name }
    const { data } = await this.$axios.post('/widgets', object)

    this.getWidgets()
  }

  async delWidget(id) {
    await this.$axios.delete('/widgets', {
      data: { id }
    })

    this.getWidgets()
  }
}
</script>
<style scoped>
.title {
  font-weight: bold;
}
</style>
