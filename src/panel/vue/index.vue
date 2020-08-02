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
              <span class="title">{{ item.name | capitalize }}</span> <b-btn variant="danger" size="sm" class="float-right" @click="delWidget(item.id)">Delete</b-btn>
            </template>
            <b-card-body class="p-0 h-100">
              <component :is="item.name" :id="item.id" />
            </b-card-body>
          </b-card>
        </grid-item>
    </grid-layout>

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
import VueGridLayout  from 'vue-grid-layout'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
import Widget from '../../bot/models/Widget'

@Component({
  components: {
    VueGridLayout,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
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
  widgets: { name: string, x: number, y: number, h: number, w: number, i: number, id: number }[] = []

  async saveWidget(index) {
    const widget = this.widgets[index]

    const { data } = await axios.post('/api/v1/widgets', widget, {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      },
    })

    return data
  }

  async created() {
    const request = await axios.get('/api/v1/widgets', {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      }
    })

    const widgets: Widget[] = request.data
    this.widgets = widgets.reduce((array, widget, index) => {
      array.push({ ...widget.toJSON(), i: index, })
      return array
    }, [])
    console.log(this.widgets)
  }

  get availableWidgets() {
    return this.available.filter(o => !this.widgets.some(w => w.name === o))
  }

  async addWidget(name) {
    let y = 0
    for (const w of this.widgets) y = Math.max(y, w.y + w.h)

    const { data } = await axios.post('/api/v1/widgets', { x: 0, y, h: 3, w: 4, name }, {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      },
    })

    this.widgets.push(data)
  }

  async delWidget(id) {
    await axios.delete('/api/v1/widgets', {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      },
      data: { id }
    })
  }
}
</script>
<style scoped>
.dashboardd {
  min-height: 100vh;
}
.title {
  font-weight: bold;
}
</style>
