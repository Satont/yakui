<template>
<div class="dashboard">
  <b-btn variant="success" block class="mb-1" v-b-modal.widgets>Add new widget</b-btn>
    <vue-draggable-resizable
      v-for="element in widgets"
      :key="element.id"
      :x="element.left"
      :y="element.top"
      :w="element.width"
      :h="element.height"
      :resizable="true"
      :grid="[3,3]"
      @dragstop="(left, top) => onDrag(element.id, left, top)"
      @resizestop="(left, top, width, height) => onResize(element.id, left, top, width, height)"
      :parent="true"
    >
    <component :is="element.name" :id="element.id" />
  </vue-draggable-resizable>
  <b-modal id="widgets" header-text-variant="dark" body-text-variant="dark" title="Choose widget" scrollable size="sm">
    <b-list-group>
      <b-list-group-item href="#" @click="addWidget(widget)" v-for="widget in availableWidgets" :key="widget">{{ widget | capitalize }}</b-list-group-item>
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

  async saveWidget(id) {
    const { name, top, left, width, height } = this.widgets.find(o => o.id === id)
    await axios.post('/api/v1/widgets', { id, name, top, left, width, height }, {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      },
    })
  }

  async created() {
    const { data } = await axios.get('/api/v1/widgets', {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      }
    })

    this.widgets = data
  }

  onResize(id, left, top, width, height) {
    const widget = this.widgets.find(o => o.id === id)
    widget.left = left
    widget.top = top
    widget.width = width
    widget.height = height
    this.saveWidget(id)
  }

  onDrag(id, left, top) {
    const widget = this.widgets.find(o => o.id === id)
    widget.left = left
    widget.top = top
    this.saveWidget(id)
  }

  get availableWidgets() {
    return this.available.filter(o => !this.widgets.some(w => w.name === o))
  }

  addWidget(name) {
    
  }
}
</script>
<style scoped>
.dashboard {
  min-height: 100vh;
}
</style>
