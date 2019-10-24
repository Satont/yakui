<template>
  <div>
    <button type="button" class="btn btn-block btn-success" @click="goToCreate">{{ translate('ui.create') }}</button>
    <br>
    <div class="row cards">
      <div class="col-md-6" :key="index" v-for="(overlay, index) in overlays">
        <div class="card bg-dark">
          <div class="card-header">
            {{ overlay.name }}
            <span class="float-right"><button class="btn btn-sm btn-info" v-clipboard:copy="`${location}/overlay?id=${overlay.id}`">{{ translate('ui.overlays.copy-link') }}</button></span>
          </div>
          <div class="card-body">
            <span class="badge badge-light card-span">{{ overlay.data | truncate(150, '...') }}</span>
          </div>
          <div class="card-footer">
            <div class="btn-group d-flex" role="group" aria-label="Basic example">
              <button
                type="button"
                class="btn btn-block btn-sm btn-info w-100"
                @click="edit(overlay)"
              >{{ translate('ui.edit') }}</button>
              <button
                type="button"
                class="btn btn-sm btn-danger w-100"
                @click="del(overlay.id, index)"
              >{{ translate('ui.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { orderBy } from 'lodash'

export default {
  data: function() {
    return {
      overlays: []
    };
  },
  methods: {
    goToCreate() {
      this.$router.push("overlays/create");
    },
    del(overlay, index) {
      this.$socket.emit('delete.overlay', overlay)
      this.overlays.splice(index, 1);
    },
    edit(overlay) {
      this.$router.push({
        name: "editOverlay",
        params: {
          id: overlay.id,
          name: overlay.name,
          data: overlay.data
        }
      });
    }
  },
  mounted() {
     this.$socket.emit('list.overlays', null, (err, list) => this.overlays = orderBy(list, 'name', 'asc'))
  },
  updated() {
     this.$socket.emit('list.overlays', null, (err, list) => this.overlays = orderBy(list, 'name', 'asc'))
  },
  filters: {
    truncate: function (text, length, suffix) {
      if (text.length > length) return text.substring(0, length) + suffix
      else return text
    }
  },
  computed: {
    location: function () {
      return window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }
  }
};
</script>