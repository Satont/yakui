<template>
<div>
    <b-btn
      block
      variant="primary"
      target="_blank"
      :href="href">
    Open
    </b-btn>
    <b-btn v-clipboard:copy="href" block class="mt-1">Copy url</b-btn>

    <b-form v-on:submit.prevent="onSubmit">
      <b-form-group label="Name" label-for="name">
        <b-form-input id="name" v-model="overlay.name" type="text" required placeholder="Enter overlay name"></b-form-input>
      </b-form-group>

      <b-form-group>
        <template slot="label" label-for="response">
          Overlay displayed data <variables-list></variables-list>
        </template>
        <b-form-textarea id="response" v-model="overlay.data" type="text" required placeholder="Overlay data" rows="4"></b-form-textarea>
      </b-form-group>

       <b-form-group>
        <template slot="label" label-for="response">
          Overlay css
        </template>
        <b-form-textarea id="css" v-model="overlay.css" type="text" placeholder="Overlay css" rows="4"></b-form-textarea>
      </b-form-group>

      <b-form-group label="Links to custom js scripts">
         <b-input-group size="sm" v-for="(script, index) in overlay.js" :key="index" class="mb-1">
            <b-form-input v-model="overlay.js[index]" type="text" placeholder="link"></b-form-input>
            <b-input-group-append><b-button size="sm" variant="danger" @click.prevent="delJs(index)">Delete</b-button></b-input-group-append>
         </b-input-group>
         <b-button class="mt-1" block size="sm" type="success" variant="success" @click.prevent="createJs">+</b-button>
      </b-form-group>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="del" variant="danger" v-if="overlay.id">Delete</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Overlay from '@bot/models/Overlay'
import axios from '../../components/axios'

@Component
export default class Edit extends Vue {
  overlay = {
    name: null,
    data: null,
    js: [],
    css: null,
  }

   async onSubmit(event) {
    await axios.post('/overlays', this.overlay)
    await this.$router.push({ name: 'OverlaysManagerList' })
  }


  async created() {
    const id = this.$route.params.id as any

    if (id) {
      this.overlay = this.$route.params as any

      const { data } = await axios.get('/overlays/' + id)

      this.overlay = data
    }
  }

  async del() {
    await axios.delete('/overlays', {
      data: { id: (this.overlay as any).id },
    })
  }

  createJs() {
    this.overlay.js.push(null);
  }

  delJs(index) {
    this.overlay.js.splice(index, 1);
  }

  get href() {
    return window.location.origin + '/overlay/custom/' + (this.overlay as any).id
  }
}
</script>
