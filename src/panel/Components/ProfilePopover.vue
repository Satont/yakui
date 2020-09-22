<template>
  <b-popover 
    show 
    target="profile-popover" 
    triggers="click" 
    placement="righttop" 
    custom-class="profile-popover"
    boundary-padding="50"
  >
    I am popover <b>component</b> content!
  </b-popover>
</template>

<script>
export default {}
</script>

<style>
.profile-popover .arrow:after {
  left: 1px;
  border-width: 6px 6px 6px 0;
  border-right-color: #fff;
  margin: 2px;
}

.profile-popover .popover-body {
  padding: 16px;
}

.profile-popover {
  z-index: 9999;
}
</style>