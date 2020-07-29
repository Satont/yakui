<template>
<div class="dashboard">
  <b-btn variant="success" block class="mb-1" v-b-modal.widgets>Add new widget</b-btn>
    <vue-draggable-resizable
      v-for="element in widgets"
      :key="element.name"
      :x="element.left"
      :y="element.top"
      :w="element.width"
      :h="element.height"
      :grid="[3,3]"
      :drag-handle="'.drag-btn'"
      @dragstop="(left, top) => onDrag(element.name, left, top)"
      @resizestop="(left, top, width, height) => onResize(element.name, left, top, width, height)"
      :parent="true"
    >
    <component :is="element.name" :id="element.id" />
  </vue-draggable-resizable>
  <b-modal id="widgets" header-text-variant="dark" body-text-variant="dark" title="Choose widget" scrollable size="sm">
    <b-list-group>
      <b-list-group-item href="#" @click="addWidget(widget); $refs['widgets'].hide()" v-for="widget in availableWidgets" :key="widget">{{ widget | capitalize }}</b-list-group-item>
    </b-list-group>
  </b-modal>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import axios from 'axios'
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
import Widget from '../../bot/models/Widget'

@Component({
  components: {
    VueDraggableResizable,
    chat: () => import('./widgets/chat.vue')
  },
  filters: {
    capitalize: (v) => {
      return v.toUpperCase()
    }
  }
})
export default class Interface extends Vue {
  available = ['chat']
  title = 'Some Widget'
  widgets: Widget[] = []
  resizable = false

  async saveWidget(name) {
    const widget = this.widgets.find(o => o.name === name)
    if (!widget) return

    const { data } = await axios.post('/api/v1/widgets', widget, {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      },
    })
    this.widgets.push(data)
  }

  async created() {
    const { data } = await axios.get('/api/v1/widgets', {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      }
    })

    this.widgets = data
  }

  onResize(name, left, top, width, height) {
    const widget = this.widgets.find(o => o.name === name)
    widget.left = left
    widget.top = top
    widget.width = width
    widget.height = height
    this.saveWidget(name)
  }

  onDrag(name, left, top) {
    const widget = this.widgets.find(o => o.name === name)
    widget.left = left
    widget.top = top
    this.saveWidget(name)
  }

  get availableWidgets() {
    return this.available.filter(o => !this.widgets.some(w => w.name === o))
  }

  addWidget(name) {
    this.widgets.push({ name, top: 10, left: 10, width: 300, height: 300 } as any)
    this.saveWidget(name)
  }
}
</script>
<style scoped>
.dashboard {
  min-height: 100vh;
}
</style>
