<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <b-form-group label="Name" label-for="name">
        <b-form-input id="name" v-model.trim="keyword.name" type="text" required placeholder="Enter keyword name"></b-form-input>
      </b-form-group>

      <b-form-group>
        <template slot="label" label-for="response">
           Response <variables-list></variables-list>
        </template>
        <b-form-input id="response" v-model="keyword.response" type="text" required placeholder="Enter keyword response"></b-form-input>
      </b-form-group>

       <b-form-group label="Cooldown" label-for="cooldown">
        <b-form-input id="cooldown" v-model="keyword.cooldown" type="number" required placeholder="Enter keyword cooldown"></b-form-input>
      </b-form-group>

      <b-button class="btn-block" variant="success" v-if="keyword.enabled" v-on:click="keyword.enabled = !keyword.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!keyword.enabled" v-on:click="keyword.enabled = !keyword.enabled">Disabled</b-button>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="del" variant="danger" v-if="keyword.id">Delete</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import Keyword from '@bot/models/Keyword'

@Component({})
export default class KeywordsManagerEdit extends Vue {
  keyword = {
    name: null,
    enabled: true,
    response: null,
    cooldown: 30,
  }

  async onSubmit(event) {
    event.preventDefault()

    await this.$axios.post('/keywords', this.keyword)
    await this.$router.push({ name: 'KeywordsManagerList' })
    this.$toast.success('Success')
  }


  async created() {
    const id = this.$route.params.id as any

    if (id) {
      this.keyword = this.$route.params as any

      const { data } = await this.$axios.get('/keywords/' + id)

      this.keyword = data
    }
  }

  async del() {
    await this.$axios.delete('/keywords', {
      data: { id: (this.keyword as any).id },
    })
    this.$toast.success('Success')
  }
}
</script>
