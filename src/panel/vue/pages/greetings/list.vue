<template>
  <div>
    <h1>Greetings list</h1>
    <p class="pb-2">
      <b-button class="btn-block" variant="primary" size="sm" @click="edit">New greeting</b-button>
    </p>
    <div class="row cards">
      <div class="col-md-6" :key="index" v-for="(greeting, index) in greetings">
        <b-card text-variant="dark" header-class="p-2" body-class="p-2" footer-class="p-2 footer">
          <template v-slot:header>
            {{ greeting.username || greeting.userId }}
          </template>
          <b-card-text>{{ greeting.message }} </b-card-text>
          <template v-slot:footer>
          <div class="m-0 text-right">
            <b-button class="btn" variant="primary" size="sm" @click="edit(greeting)">Edit</b-button>
            <b-button class="btn" variant="danger" size="sm" @click="del(greeting.id, index)">Delete</b-button>
          </div>
          </template>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import axios from 'axios'

@Component
export default class GreetingsManagerList extends Vue {
  space = 'greetings'
  greetings = []

  async created() {
    const greetings = await axios.get('/api/v1/greetings', { headers: {
      'x-twitch-token': localStorage.getItem('accessToken')
    }})

    this.greetings = greetings.data
  }

  async edit(params) {
    await this.$router.push({ name: 'GreetingsManagerEdit', params })
  }

  async del(id, index) {
    await axios.delete('/api/v1/greetings', {
      data: { id },
      headers: {
        'x-twitch-token': localStorage.getItem('accessToken')
      }
    })
    this.greetings.splice(index, 1)
  }
}
</script>

<style scoped>
.btn {
  opacity: 1 !important;
}
.footer {
  display: flex; justify-content: space-between;
}
.cards > div > div.card {
  height: calc(100% - 15px);
  margin-bottom: 15px;
  padding-right: 0px !important;
  padding-left: 0px !important;
}
.card-span {
  display: block !important;
  white-space: normal !important;
}
.card-body > div.btn-group {
  margin-bottom: 5px;
}
</style>
