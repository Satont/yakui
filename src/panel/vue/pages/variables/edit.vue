<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <b-form-group label="Name" label-for="name">
        <b-form-input
          id="name"
          v-model="variable.name"
          v-on:keyup="nameReplacer"
          type="text"
          required
          placeholder="Enter variable name"
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Response" label-for="response">
        <b-form-input id="response" v-model="variable.response" type="text" required placeholder="Enter variable response"></b-form-input>
      </b-form-group>

      <b-button class="btn-block" variant="success" v-if="variable.enabled" v-on:click="variable.enabled = !variable.enabled"
        >Enabled</b-button
      >
      <b-button class="btn-block" variant="warning" v-if="!variable.enabled" v-on:click="variable.enabled = !variable.enabled"
        >Disabled</b-button
      >

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="del" variant="danger" v-if="variable.id">Delete</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class CustomVariablesManagerEdit extends Vue {
  variable = {
    name: null,
    enabled: true,
    response: null,
  };

  async onSubmit(event) {
    event.preventDefault();

    await this.$axios.post('/variables', this.variable);
    await this.$router.push({ name: 'CustomVariablesManagerList' });
    this.$toast.success('Success');
  }

  async created() {
    const id = this.$route.params.id as any;

    if (id) {
      this.variable = this.$route.params as any;

      const { data } = await this.$axios.get('/variables/' + id);

      this.variable = data;
    }
  }

  async del() {
    await this.$axios.delete('/variables', {
      data: { id: (this.variable as any).id },
    });
    this.$toast.success('Success');
  }

  nameReplacer() {
    this.variable.name = this.variable.name.replace(/\s/gm, '');
  }
}
</script>
