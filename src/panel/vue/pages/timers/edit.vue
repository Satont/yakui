<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <b-form-group label="Timer name" label-for="name">
        <b-form-input id="name" v-model="timer.name" type="text" required placeholder="Enter timer name"></b-form-input>
      </b-form-group>

      <b-form-group label="Timer interval" label-for="interval">
        <b-form-input id="interval" v-model.number="timer.interval" type="number" placeholder="Enter timer interval"></b-form-input>
      </b-form-group>

      <b-form-group label="Timer messages interval" label-for="interval_messages">
        <b-form-input
          id="interval_messages"
          v-model.number="timer.messages"
          type="number"
          placeholder="Enter timer messages interval"
        ></b-form-input>
      </b-form-group>

      <b-form-group>
        <template slot="label"> Timer responses <variables-list></variables-list> </template>
        <b-input-group size="sm" v-for="(response, index) in timer.responses" :key="index" class="mb-1">
          <b-form-input v-model="timer.responses[index]" type="text" placeholder="Timer response"></b-form-input>
          <b-input-group-append
            ><b-button size="sm" variant="danger" @click.prevent="delResponse(index)">Delete</b-button></b-input-group-append
          >
        </b-input-group>
        <b-button class="mt-1" block size="sm" type="success" variant="success" @click.prevent="addResponse">+</b-button>
      </b-form-group>

      <b-button class="btn-block" variant="success" v-if="timer.enabled" v-on:click="timer.enabled = !timer.enabled">Enabled</b-button>
      <b-button class="btn-block" variant="warning" v-if="!timer.enabled" v-on:click="timer.enabled = !timer.enabled">Disabled</b-button>

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="del" variant="danger" v-if="timer.id">Delete</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Timers } from '@prisma/client';

@Component({})
export default class TimersManagerEdit extends Vue {
  timer = {
    name: null,
    enabled: true,
    responses: [],
    interval: 60,
    messages: 0,
  };

  async onSubmit(event) {
    event.preventDefault();
    this.filterResponses();

    if (!this.timer.responses.length) {
      return alert('Responses cannot be empty');
    }

    await this.$axios.post('/timers', this.timer);
    await this.$router.push({ name: 'TimersManagerList' });
    this.$toast.success('Success');
  }

  filterResponses() {
    this.timer.responses = this.timer.responses.filter((o) => o !== '' && o);
  }

  async created() {
    const id = this.$route.params.id as any;

    if (id) {
      this.timer = this.$route.params as any;

      const { data } = await this.$axios.get('/timers/' + id);

      this.timer = data;
    }
  }

  async del() {
    await this.$axios.delete('/timers', {
      data: { id: (this.timer as any).id },
    });
    this.$toast.success('Success');
  }

  addResponse() {
    this.timer.responses.push(null);
  }

  delResponse(index) {
    this.timer.responses.splice(index, 1);
  }
}
</script>
