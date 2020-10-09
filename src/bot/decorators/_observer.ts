export const cache = {}

export const setupObserver = ({ instance, propertyName }) => {
  const instanceName = instance.constructor.name.toLowerCase()
  if (!cache[instanceName]) {
    cache[instanceName] = {}
  }
  if (!cache[instanceName][propertyName]) {
    cache[instanceName][propertyName] = {
      value: instance[propertyName],
      previousValue: undefined,
      firstChange: undefined,
      onChange: undefined,
    }
    Object.defineProperty(instance, propertyName, {
      set: function (value) {
        cache[instanceName][propertyName].firstChange = cache[instanceName][propertyName].firstChange === undefined
        if (cache[instanceName][propertyName].value === value) return

        cache[instanceName][propertyName].value = value
  
        if (!cache[instanceName][propertyName].firstChange && cache[instanceName][propertyName].onChange) {
          instance[cache[instanceName][propertyName].onChange].call(instance)
        }

        return true
      },
      get: function () {
        return cache[instanceName][propertyName].value
      },
    })
    
  }
}
