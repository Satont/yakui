<template>
<div>
  <center><h2>Events</h2></center>
  <ul id="navigation">
    <li><a href="#one" class="btn btn-primary btn-sm">1</a></li>
    <li><a href="#two" class="btn btn-primary btn-sm">2</a></li>
    <li><a href="#three" class="btn btn-primary btn-sm">3</a></li>
    <li><a href="#four" class="btn btn-primary btn-sm">4</a></li>
    <li><a href="#five" class="btn btn-primary btn-sm">5</a></li>
  </ul>
  <div id="content-slider">
    <ul id="content-slider-inside">
      <li id="one">1</li>
      <li id="two">2</li>
      <li id="three">3</li>
      <li id="four">4</li>
      <li id="five">5</li>
    </ul>
  </div>
</div>
</template>

<script>
export default {
  data: function() {
    return {
      tip: {
        operations: []
      }
    };
  },
  mounted() {
    let self = this;
    this.$socket.emit('list.variables', null, (err, list) => this.variables = list)
  }
};
</script>

<style>
#content-slider {
  width: 650px;
  overflow: hidden;
  height: 300px;
}

#content-slider-inside {
  list-style: none;
  height: 320px;    
  overflow: scroll; 
  overflow-y: hidden;
}

#content-slider-inside li {
  width: 650px;
  height: 300px;
}

#navigation {
  list-style: none;
  margin: 20px 0;
  overflow: hidden;
}
#navigation li {
  display: inline-block;
}
</style>