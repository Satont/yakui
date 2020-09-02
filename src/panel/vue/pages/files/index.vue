<template>
<div>
  <form method="post" enctype="multipart/form-data" @submit.prevent="submit">
    <input type="file" id="filesForUpload" ref="filesForUpload" multiple v-on:change="handleFileUploads" />
    <input type="submit" value="Send" v-bind:disabled="!this.loading" />
  </form>
  <br>
  <div class="card-deck mb-3" v-for="(chunk, index) of chunks" :key="'chunk-' + index">
    <div class="card" v-for="file of chunk" :key="file.id">
      <div class="card-body border-top p-0 text-right" style="flex: 0 1 auto;">
        <a v-bind:href="'/api/v1/files/'+ file.id" class="btn btn-outline-dark p-3 border-0 w-100" target="_blank">{{ file.name || file.id }}</a>
      </div>
      <div class="card-body border-top p-0 text-right" style="flex: 1 1 auto;">
        <img class="w-100" :src="file.data" v-if="file.type.startsWith('image')">
        <audio controls v-if="file.type.startsWith('audio')">
          <source v-bind:src="file.data" :type="file.type"/>
        </audio>
      </div>

       <div class="card-footer p-0">
        <b-btn @click="del(file.id)" variant="danger" class="btn-reverse w-100">Delete</b-btn>
      </div>
    </div>
    <div class="card" v-for="index in (4 - chunk.length)" style="visibility: hidden" :key="'empty-' + index"></div>
  </div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { getNameSpace } from '@panel/vue/plugins/socket'
import _ from 'lodash'

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

  get chunks() {
    return _.chunk(this.files, 4)
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
