<template>
<div>
    <h1>Overlays list</h1>
    <p class="pb-2">
      <b-button class="btn-block" variant="primary" size="sm" @click="edit">New overlay</b-button>
    </p>
    <b-card-group deck>
      <b-card v-for="(overlay, index) in overlays" :key="overlay.id" :header="overlay.name" text-variant="dark" header-class="p-2" body-class="p-2" footer-class="p-2 footer">
        <b-card-body>
          {{ overlay.data | truncate }}
        </b-card-body>
        <template v-slot:footer>
         <div class="m-0 text-right">
           <b-btn variant="success" size="sm" @click="copy(overlay.id)">Copy url</b-btn>
           <b-button class="btn" variant="primary" size="sm" @click="edit(overlay)">Edit</b-button>
           <b-button class="btn" variant="danger" size="sm" @click="del(overlay.id, index)">Delete</b-button>
         </div>
        </template>
      </b-card>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import Overlay from '@bot/models/Overlay'
import axios from 'axios'

@Component({
  filters: {
    truncate(text: string) {
      return text.length > 150 ? text.substr(0, 150) + '...' : text
    }
  }
})
export default class OverlaysList extends Vue {
  overlays: Overlay[] = []

  async created() {
    const overlays = await axios.get('/api/v1/overlays', {
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      }
    })

    this.overlays = overlays.data
  }

  async edit(params) {
    await this.$router.push({ name: 'OverlaysManagerEdit', params })
  }

  async del(id, index) {
    await axios.delete('/api/v1/overlays', {
      data: { id },
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      }
    })

    this.overlays.splice(index, 1)
  }

  copy(id) {
    const url = window.location.origin + '/overlay/custom/' + id
    this.$copyText(url)
  }
}
</script>
