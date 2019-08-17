<template>
  <div>
    <button type="button" class="btn btn-block btn-success" @click="goToCreate">Create Keyword</button>
    <br>
    <div class="row cards">
      <div class="col-md-6" :key="index" v-for="(keyword, index) in keywords">
        <div class="card bg-dark">
          <div class="card-header">{{ keyword.name }}</div>
          <div class="card-body">
            <span class="badge badge-light card-span">{{ keyword.response | truncate(150, '...') }}</span>
          </div>
          <div class="card-footer">
            <div class="btn-group d-flex" role="group" aria-label="Basic example">
              <button
                type="button"
                class="btn btn-block btn-sm btn-info w-100"
                @click="editKeyword(keyword)"
              >Edit</button>
              <button
                type="button"
                class="btn btn-sm btn-danger w-100"
                @click="deleteKeyword(keyword.name, index)"
              >Delete</button>
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
      keywords: []
    };
  },
  methods: {
    goToCreate() {
      this.$router.push("keywords/create");
    },
    deleteKeyword(keyword, index) {
      this.$socket.emit('delete.keyword', keyword.replace('%20', ' '))
      this.keywords.splice(index, 1);
    },
    editKeyword(keyword) {
      this.$router.push({
        name: "editKeyword",
        params: {
          id: keyword.id,
          name: keyword.name,
          response: keyword.response,
          response: keyword.cooldown,
          visible: keyword.visible,
        }
      });
    }
  },
  filters: {
    truncate: function (text, length, suffix) {
      if (text.length > length) return text.substring(0, length) + suffix
      else return text
    }
  },
  mounted() {
    this.$socket.emit('list.keywords', null, (err, list) => this.keywords = _.orderBy(list, 'name', 'asc'))
  },
  updated() {
    this.$socket.emit('list.keywords', null, (err, list) => this.keywords = _.orderBy(list, 'name', 'asc'))
  }
};
</script>