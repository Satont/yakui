String.prototype.includesOneOf = function(arrayOfStrings) {
  if(!Array.isArray(arrayOfStrings)) {
    throw new Error('includesOneOf only accepts an array')
  }
  return arrayOfStrings.some(str => this.includes(str))
}