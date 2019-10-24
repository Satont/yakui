<template>
  <div>
    <button type="button" class="btn btn-block btn-success" @click="goToCreate"> {{ translate('ui.create') }} </button>
    <br>
    <div class="row cards">
      <div class="col-md-6" :key="index" v-for="(variable, index) in variables">
        <div class="card bg-dark">
          <div class="card-header">{{ variable.name }}</div>
          <div class="card-body">
            <span class="badge badge-light card-span">{{ variable.value }}</span>
          </div>
          <div class="card-footer">
            <div class="btn-group d-flex" role="group" aria-label="Basic example">
              <button
                type="button"
                class="btn btn-block btn-sm btn-info w-100"
                @click="editVariable(variable)"
              > {{ translate('ui.edit') }}</button>
              <button
                type="button"
                class="btn btn-sm btn-danger w-100"
                @click="deleteVariable(variable.name, index)"
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
      variables: []
    };
  },
  methods: {
    goToCreate() {
      this.$router.push("variables/create");
    },
    deleteVariable(variable, index) {
      this.$socket.emit('delete.variable', variable)
      this.variables.splice(index, 1);
    },
    editVariable(variable) {
      console.log(variable)
      this.$router.push({
        name: "editVariable",
        params: {
          id: variable.id,
          name: variable.name,
          value: variable.value
        }
      });
    }
  },
  mounted() {
     this.$socket.emit('list.variables', null, (err, list) => this.variables = orderBy(list, 'name', 'asc'))
  },
  updated() {
     this.$socket.emit('list.variables', null, (err, list) => this.variables = orderBy(list, 'name', 'asc'))
  }
};
</script>