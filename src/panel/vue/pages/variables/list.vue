<template>
  <div>
    <h1>Variables list</h1>
    <p class="pb-2">
      <b-button class="btn-block" variant="primary" size="sm" @click="edit">New variable</b-button>
    </p>
    <b-card-group deck>
      <b-card v-for="(variable, index) in variables" :key="variable.id" :header="variable.name" text-variant="dark" header-class="p-2" body-class="p-2" footer-class="p-2 footer">
        <b-card-body>
          {{ variable.response }}
        </b-card-body>
        <template v-slot:footer>
         <div class="m-0 text-right">
           <b-button class="btn" variant="primary" size="sm" @click="edit(variable)">Edit</b-button>
           <b-button class="btn" variant="danger" size="sm" @click="del(variable.id, index)">Delete</b-button>
         </div>
        </template>
      </b-card>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Variable from '@bot/models/Variable'
import { Route } from 'vue-router'
import axios from '../../components/axios'

@Component
export default class CustomVariaiblesManagerList extends Vue {
  variables: Variable[] = []

  async created() {
    const { data } = await axios.get('/variables')
    this.variables = data
  }

  async edit(params) {
    await this.$router.push({ name: 'CustomVariablesManagerEdit', params })
  }

  async del(id, index) {
    await axios.delete('/variables', {
      data: { id },
    })
    this.variables.splice(index, 1)
  }
}
</script>

<style scoped>
.btn {
  opacity: 1 !important;
}
</style>
