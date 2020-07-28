<template>
<div>
  <vue-draggable-resizable
    class-name-active="my-active-class"
    v-for="element in [{ name: 'chat', id: 0, left: -22, top: -7, width: 560, height: 560 }]"
    :key="element.id"
    :x="element.left"
    :y="element.top"
    :w="element.width"
    :h="element.height"
    :resizable="true"
    @dragstop="(left, top) => onDrag(element.id, left, top)"
    @resizestop="(left, top, width, height) => onResize(element.id, left, top, width, height)"
  >
  <component :is="element.name" />
</vue-draggable-resizable>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

@Component({
  components: {
    VueDraggableResizable,
    chat: () => import('./widgets/chat.vue')
  },
})
export default class Interface extends Vue {
  title = 'Some Widget'

  onResize(id, left, top, width, height) {
   console.log(id, left, top, width, height)
  }

  onDrag(id, left, top) {
    console.log(id, left, top)
  }
}
</script>
