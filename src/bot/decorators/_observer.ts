import { orm } from '../libs/db'
import { Settings } from '../entities/Settings'

export const cache = {}

export const setupObserver = ({ instance, propertyName }: { instance?: any, propertyName: any }) => {
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

        cache[instanceName][propertyName].previousValue = cache[instanceName][propertyName].value
        cache[instanceName][propertyName].value = value

        if (!cache[instanceName][propertyName].firstChange) {
          updateValue({ space: instanceName, name: propertyName, value })
        }

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

const updateValue = async ({ space, name, value }) => {
  const repository = orm.em.getRepository(Settings)
  const item = await repository.findOne({ space, name })
  if (item) {
    item.value = value
    await repository.nativeUpdate({ name, space }, { value })
  } else {
    await repository.nativeInsert({ space, name, value })
  }
}
