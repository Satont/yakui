<template>
  <div>
    <b-form v-on:submit.prevent="onSubmit">
      <b-form-group label="Command name" label-for="name">
        <b-form-input
          id="name"
          v-model.trim="command.name"
          v-on:keyup="nameReplacer"
          type="text"
          required
          placeholder="Enter command name"
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Command aliases">
        <b-input-group size="sm" v-for="(aliase, index) in command.aliases" :key="index" class="mb-1">
          <b-form-input v-model="command.aliases[index]" type="text" placeholder="Command aliase"></b-form-input>
          <b-input-group-append
            ><b-button size="sm" variant="danger" @click.prevent="delAliase(index)">Delete</b-button></b-input-group-append
          >
        </b-input-group>
        <b-button class="mt-1" block size="sm" type="success" variant="success" @click.prevent="createAliase">+</b-button>
      </b-form-group>

      <b-form-group label="Command cooldown" label-for="cooldown">
        <b-form-input id="cooldown" v-model.number="command.cooldown" type="number" placeholder="Enter command cooldown"></b-form-input>
      </b-form-group>

      <b-form-group label="Command price" label-for="price">
        <b-form-input id="price" v-model.number="command.price" type="number" placeholder="Enter command price"></b-form-input>
      </b-form-group>

      <b-form-group label="Command permission" label-for="permission">
        <b-form-select v-model="command.permission" :options="avaliablePermissions" size="sm"></b-form-select>
      </b-form-group>

      <b-form-group>
        <template slot="label" label-for="response"> Command response <variables-list></variables-list> </template>
        <b-form-textarea
          id="response"
          v-model="command.response"
          type="text"
          required
          placeholder="Enter command response"
          rows="3"
        ></b-form-textarea>
      </b-form-group>

      <b-form-group label="Command description" label-for="description">
        <b-form-input id="description" v-model="command.description" type="text" placeholder="Enter command description"></b-form-input>
      </b-form-group>

      <b-form-group label="Command visibility" label-for="visibility">
        <b-btn
          v-bind:class="{ 'btn-success': command.visible, 'btn-danger': !command.visible }"
          v-on:click="command.visible = !command.visible"
        >
          <span v-show="command.visible">Visible</span>
          <span v-show="!command.visible">Not visible</span>
        </b-btn>
      </b-form-group>

      <b-form-group label="Command sound" label-for="sound">
        <b-form-select id="sound" v-model="command.sound_file" :options="selectOptions"></b-form-select>
      </b-form-group>

      <div v-if="command.sound_file">
        <label for="pitch">Sound volume: {{ command.sound_volume }}</label>
        <b-form-input id="pitch" v-model="command.sound_volume" type="range" min="1" max="100" step="1"></b-form-input>
      </div>

      <b-button class="btn-block" variant="success" v-if="command.enabled" @click.prevent="command.enabled = !command.enabled"
        >Enabled</b-button
      >
      <b-button class="btn-block" variant="warning" v-if="!command.enabled" @click.prevent="command.enabled = !command.enabled"
        >Disabled</b-button
      >

      <b-button class="btn-block" type="submit" variant="primary">Save</b-button>
      <b-button class="btn-block" @click="del" variant="danger" v-if="command.id">Delete</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Command } from 'typings';
import { CommandPermission } from '.prisma/client';

@Component
export default class CommandsManagerEdit extends Vue {
  command: Command = {
    name: null,
    response: null,
    cooldown: 10,
    visible: true,
    permission: 'VIEWERS',
    description: null,
    aliases: [],
    price: 0,
    enabled: true,
    sound_file: undefined,
    sound_volume: 50,
  };

  avaliablePermissions: Array<{ value: CommandPermission; text: string }> = [
    { value: 'VIEWERS', text: 'Viewers' },
    { value: 'FOLLOWERS', text: 'Followers' },
    { value: 'VIPS', text: 'Vips' },
    { value: 'SUBSCRIBERS', text: 'Subscribers' },
    { value: 'MODERATORS', text: 'Moderators' },
    { value: 'BROADCASTER', text: 'Broadcaster' },
  ];

  get selectOptions() {
    return [{ value: null, text: 'No sound' }, ...this.audiosList];
  }

  get audiosList(): any[] {
    return (
      this.$store.state.filesList?.filter((s) => s.type.startsWith('audio'))?.map((file) => ({ value: file.id, text: file.name })) || []
    );
  }

  async onSubmit(event) {
    event.preventDefault();
    this.filterAliases();

    await this.$axios.post('/commands', this.command, {});
    await this.$router.push({ name: 'CommandsManagerList' });
    this.$toast.success('Success');
  }

  filterAliases() {
    this.command.aliases = this.command.aliases.filter((o) => o !== '' && o);
  }

  async mounted() {
    const id = this.$route.params.id as any;

    if (id) {
      const { data } = await this.$axios.get('/commands/' + id);

      this.command = data;
    }
  }

  async del() {
    await this.$axios.delete('/commands', {
      data: { id: this.command.id },
    });
    await this.$router.push({ name: 'CommandsManagerList' });
    this.$toast.success('Success');
  }

  createAliase() {
    this.command.aliases.push(null);
  }

  delAliase(index) {
    this.command.aliases.splice(index, 1);
  }

  nameReplacer() {
    if (this.command.name.startsWith('!')) this.command.name = this.command.name.replace('!', '');
  }
}
</script>
