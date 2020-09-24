<template>
  <b-popover 
    target="profile-popover" 
    triggers="click" 
    placement="righttop" 
    custom-class="profile-popover"
    boundary-padding="50"
  >
    <div class="item d-flex justify-content-between">
      <span>Points</span> 
      <span>{{ $store.state.loggedUser.loggedUser.points | formatNumbersWithSpaces }}</span>
    </div>
    <div class="item d-flex justify-content-between">
      <span>Messages</span> 
      <span>{{$store.state.loggedUser.loggedUser.messages | formatNumbersWithSpaces }}</span>
    </div>
    <div class="item d-flex justify-content-between">
      <span>Watched</span> 
      <span>{{ $store.state.loggedUser.loggedUser.watched }}</span>
    </div>
    <div class="item d-flex justify-content-between">
      <span>Bits</span> 
      <span>{{ $store.state.loggedUser.loggedUser.bits | formatNumbersWithSpaces }}</span>
    </div>
    <div class="item d-flex justify-content-between">
      <span>Donated</span> 
      <span>{{ $store.state.loggedUser.loggedUser.tips | formatNumbersWithSpaces }} currency</span>
    </div>

    <b-btn block size="sm" variant="purple">Log Out</b-btn>
  </b-popover>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class ProfilePopover extends Vue {
  
}
</script>

<style>
.profile-popover {
  min-width: 200px;
  z-index: 9999;
}

.profile-popover .arrow:after {
  left: 1px;
  border-width: 6px 6px 6px 0;
  border-right-color: #fff;
  margin: 2px;
}

.profile-popover .popover-body {
  padding: 16px;
}

.profile-popover .item {
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: #A9A9A9;
  margin-bottom: 6px;
}

.profile-popover .item span:nth-child(2){
  color: #2F2F2F;
  font-weight: bold;
}
</style>