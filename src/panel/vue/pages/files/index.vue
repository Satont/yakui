<template>
  <div>
    <form method="post" enctype="multipart/form-data" @submit.prevent="submit">
      <input type="file" id="filesForUpload" ref="filesForUpload" multiple v-on:change="handleFileUploads" />
      <input type="submit" value="Send" v-bind:disabled="!this.loading" />
    </form>
    <br>
    <b-card-group columns>
      <div v-for="file of files" v-bind:key="file.id">
        <b-card
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="mb-2"
          v-if="file.type.startsWith('image')"
          :header="file.name"
          no-body
          header-text-variant="dark"
        >
          <b-card-img v-bind:src="file.data" alt="Image" bottom />
          <template v-slot:footer>
            <b-button href="#" block size="sm" variant="danger" @click="del(file.id)">Delete</b-button>
          </template>
        </b-card>

        <b-card
          style="max-width: 20rem;"
          class="mb-2"
          v-if="file.type.startsWith('audio')"
          :header="file.name"
          header-text-variant="dark"
        >
          <b-card-body>
            <audio controls v-if="file.type.startsWith('audio')">
              <source v-bind:src="file.data" :type="file.type"/>
            </audio>
          </b-card-body>
          <template v-slot:footer>
            <b-button href="#" block size="sm" variant="danger" @click="del(file.id)">Delete</b-button>
          </template>
        </b-card>
      </div>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import socket, { getNameSpace } from '@panel/vue/plugins/socket'

@Component
export default class Files extends Vue {
  files = []
  filesForUpload = []
  loading = false
  socket = getNameSpace('systems/files')

  mounted() {
    this.refresh()
  }

  refresh() {
    this.socket.emit('getAll', (error, data) => this.files = data)
  }

  del(id: number) {
    this.socket.emit('delete', id, (error, data) => this.refresh())
  }

  async submit() {
    this.socket.emit('insert', this.filesForUpload, (error, response) => {
      this.loading = false
      this.refresh()
    })
  }

  handleFileUploads(e) {
    this.loading = true
    console.log(e.target)
    const files = e.target.files || e.dataTransfer.files
    if (!files.length) return
    const readers = {}

    let i = 0
    for (i = 0; i < files.length; i++) {
      readers[i] = new FileReader()
      const index = i
      readers[i].onload = f => {
        const dataURI = f.target.result
        this.filesForUpload.push({ name: files[index].name, data: dataURI, type: files[index].type })
        i - 1 === files.length ? this.loading = false : this.loading = true
      }

      readers[i].readAsDataURL(e.target.files[i])
    }
  }
}
</script>

<style scoped>
.card-img-bottom {
  height: 175px;
  border: 0px !important;
}
.card-body {
  padding: 5px;
}
</style>
