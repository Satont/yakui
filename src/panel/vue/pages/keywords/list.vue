<template>
  <div>
    <h1>Keywords list</h1>
    <p class="pb-2">
      <b-button class="btn-block" variant="primary" size="sm" @click="edit">New keyword</b-button>
    </p>
    <b-card-group deck>
      <b-card
        v-for="(keyword, index) in keywords"
        :key="keyword.id"
        :header="keyword.name"
        text-variant="dark"
        header-class="p-2"
        body-class="p-2"
        footer-class="p-2 footer"
      >
        <b-card-body>
          {{ keyword.response }}
        </b-card-body>
        <template v-slot:footer>
          <div class="m-0 text-right">
            <b-button class="btn" variant="primary" size="sm" @click="edit(keyword)">Edit</b-button>
            <b-button class="btn" variant="danger" size="sm" @click="del(keyword.id, index)">Delete</b-button>
          </div>
        </template>
      </b-card>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Keywords } from '@prisma/client';
import { Route } from 'vue-router';

@Component
export default class KeywordsManagerList extends Vue {
  keywords: Keywords[] = [];

  async created() {
    const { data } = await this.$axios.get('/keywords');
    this.keywords = data;
  }

  async edit(params) {
    await this.$router.push({ name: 'KeywordsManagerEdit', params });
  }

  async del(id, index) {
    await this.$axios.delete('/keywords', {
      data: { id },
    });
    this.keywords.splice(index, 1);
    this.$toast.success('Success');
  }
}
</script>

<style scoped>
.btn {
  opacity: 1 !important;
}
</style>
