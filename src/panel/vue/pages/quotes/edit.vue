<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <b-form-group label="Text" label-for="text">
        <b-form-textarea
          id="text"
          v-model.trim="quote.text"
          type="text"
          required
          placeholder="Enter quote text"
        />
      </b-form-group>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="del" variant="danger" v-if="quote.id">Delete</b-button>
    </b-form>
    </div>
</template>

<script lang="ts">
import { Quotes } from '@prisma/client';
import { Component } from 'vue-property-decorator';
import { EnvChecker } from '../helpers/mixins';

@Component
export default class QuotesManagerEdit extends EnvChecker {
  quote: Partial<Quotes> = {}

  async mounted() {
    const id = this.$route.params.id as unknown as number;

    if (id) {
      const quote = await this.$axios.get(`/quotes/${id}`)
      this.quote = quote.data
    }
  }

  async onSubmit() {
    await this.$axios.post('/quotes', this.quote);
    await this.$router.push({ name: 'QuotesManagerList' });
    this.$toast.success('Success');
  }

  async del() {
    await this.$axios.delete(`/quotes/${this.quote.id}`);
    await this.$router.push({ name: 'QuotesManagerList' });
    this.$toast.success('Success');
  }
}
</script>