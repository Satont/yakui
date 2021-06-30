<template>
  <div>
    <h1>Timers list</h1>
    <p class="pb-2">
      <b-button class="btn-block" variant="primary" size="sm" @click="edit">New timer</b-button>
    </p>

    <b-card-group deck>
      <b-card v-for="(timer, index) in timers" :key="timer.id" :header="timer.name" text-variant="dark" header-class="p-2" body-class="p-2" footer-class="p-2 footer">
        <b-list-group flush>
          <b-list-group-item v-for="(response, index) in timer.responses" :key="index" class="p-2">{{ response }}</b-list-group-item>
        </b-list-group>
        <template v-slot:footer>
         <div class="m-0 text-right">
           <b-button class="btn" variant="primary" size="sm" @click="edit(timer)">Edit</b-button>
           <b-button class="btn" variant="danger" size="sm" @click="del(timer.id, index)">Delete</b-button>
         </div>
        </template>
      </b-card>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { Timers } from '@prisma/client'

@Component
export default class TimersManagerList extends Vue {
  timers: Timers[] = []

  async created() {
    const { data } = await this.$axios.get('/timers')
    this.timers = data
  }

  async edit(params) {
    await this.$router.push({ name: 'TimersManagerEdit', params })
  }

  async del(id, index) {
    await this.$axios.delete('/timers', {
      data: { id },
    })
    this.timers.splice(index, 1)
    this.$toast.success('Success')
  }
}
</script>

<style scoped>
.btn {
  opacity: 1 !important;
}
</style>
