<template>
  <div>
    <h1>Overlays list</h1>
    <b-button size="sm" variant="primary" @click="show = 'custom'">Custom</b-button>
    <b-button size="sm" variant="primary" @click="show = 'default'">Default</b-button>
    <p class="pb-2 mt-2" v-if="show === 'custom'">
      <b-button class="btn-block" variant="primary" size="sm" @click="edit">New overlay</b-button>
    </p>
    <b-card-group deck v-if="show === 'custom'" class="mt-2">
      <b-card
        v-for="(overlay, index) in overlays"
        :key="overlay.id"
        :header="overlay.name"
        text-variant="dark"
        header-class="p-2"
        body-class="p-2"
        footer-class="p-2 footer"
      >
        <b-card-body>
          {{ overlay.data | truncate }}
        </b-card-body>
        <template v-slot:footer>
          <div class="m-0 text-right">
            <b-btn variant="success" size="sm" @click="copy(overlay.id)">Copy url</b-btn>
            <b-button class="btn" variant="primary" size="sm" @click="edit(overlay)">Edit</b-button>
            <b-button class="btn" variant="danger" size="sm" @click="del(overlay.id, index)">Delete</b-button>
          </div>
        </template>
      </b-card>
    </b-card-group>

    <b-card-group deck v-if="show === 'default'" class="mt-2">
      <b-card header="Alerts" text-variant="dark" header-class="p-2" body-class="p-2" footer-class="p-2 footer">
        <b-card-body>
          Overlay for getting live alerts from bot
        </b-card-body>
        <template v-slot:footer>
          <div class="m-0 text-right">
            <b-btn variant="success" size="sm" @click="copyCustom('alerts')">Copy url</b-btn>
          </div>
        </template>
      </b-card>
      <b-card header="TTS" text-variant="dark" header-class="p-2" body-class="p-2" footer-class="p-2 footer">
        <b-card-body>
          Overlay speaking some message
        </b-card-body>
        <template v-slot:footer>
          <div class="m-0 text-right">
            <b-btn variant="success" size="sm" @click="copyCustom('tts')">Copy url</b-btn>
          </div>
        </template>
      </b-card>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Overlays } from '@prisma/client';

@Component({
  filters: {
    truncate(text: string) {
      return text.length > 150 ? text.substr(0, 150) + '...' : text;
    },
  },
})
export default class OverlaysList extends Vue {
  overlays: Overlays[] = [];
  show = 'custom';

  async created() {
    const overlays = await this.$axios.get('/overlays');

    this.overlays = overlays.data;
  }

  async edit(params) {
    await this.$router.push({ name: 'OverlaysManagerEdit', params });
  }

  async del(id, index) {
    await this.$axios.delete('/overlays', {
      data: { id },
    });

    this.overlays.splice(index, 1);
    this.$toast.success('Success');
  }

  copy(id) {
    const url = window.location.origin + '/overlay/custom/' + id;
    this.$copyText(url);
  }

  copyCustom(name) {
    const url = window.location.origin + '/overlay/' + name;
    this.$copyText(url);
  }
}
</script>
