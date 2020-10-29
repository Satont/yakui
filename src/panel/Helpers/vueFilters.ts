import Vue from 'vue'

Vue.filter('formatNumbersWithSpaces', (value: string | number) => {
  if (value === undefined) return ''
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
})