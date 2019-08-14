<template>
  <div>
    <button type="button" class="btn btn-block btn-success" @click="goToCreate">Create timer</button>
    <br>
    <div class="row cards">
      <div class="col-md-6" :key="index" v-for="(timer, index) in timers">
        <div class="card bg-dark">
          <div class="card-header">
            {{ timer.name }}
            <span class="badge badge-primary float-right">{{ timer.interval }} sec.</span>
          </div>
          <div class="card-body">
            <span
              class="badge badge-light card-span"
              v-for="response of timer.responses"
              :key="response"
              style="margin-top:5px"
            >{{ response }}</span>
          </div>
          <div class="card-footer">
            <div class="btn-group d-flex" role="group" aria-label="Basic example">
              <button
                type="button"
                class="btn btn-block btn-sm btn-info w-100"
                @click="edittimer(timer)"
              >Edit</button>
              <button
                type="button"
                class="btn btn-sm btn-danger w-100"
                @click="deletetimer(timer, index)"
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
      timers: null
    };
  },
  methods: {
    goToCreate() {
      this.$router.push("timers/create");
    },
    deletetimer(timer, index) {
      this.$socket.emit('delete.timer', timer.id)
      this.timers.splice(index, 1);
    },
    edittimer(timer) {
      this.$router.push({
        name: "editTimer",
        params: {
          id: timer.id,
          name: timer.name,
          interval: timer.interval,
          responses: timer.responses
        }
      });
    }
  },
  mounted() {
    this.$socket.emit('list.timers', null, (err, list) => this.timers = _.orderBy(list, 'name', 'asc'))
  },
  updated() {
    this.$socket.emit('list.timers', null, (err, list) => this.timers = _.orderBy(list, 'name', 'asc'))
  }
};
</script>