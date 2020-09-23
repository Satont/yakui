import Vue from 'vue'

Vue.filter('formatNumbersWithSpaces', function (value: string | number) {
  if (!value) return ''
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
})