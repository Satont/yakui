import { orm } from '../libs/db'
import { Settings } from '../entities/Settings'

export const cache = {}

type Opts = { 
  instance?: any, 
  propertyName: any, 
  fromSettings?: boolean 
}

export const setupObserver = ({ instance, propertyName, fromSettings = false } = {} as Opts) => {
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
      settings: {
        shouldLoad: fromSettings,
        loaded: false,
      },
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

        const shouldCallChange = shouldCallOnChange({
          firstChange: cache[instanceName][propertyName].firstChange,
          setuped: cache[instanceName][propertyName].onChange,
          settings: cache[instanceName][propertyName].settings,
        })

        if (shouldCallChange) {
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
  const repository = orm.em.fork().getRepository(Settings)
  const item = await repository.findOne({ space, name })
  if (item) {
    await repository.nativeUpdate({ space, name }, { value: JSON.stringify(value) })
  } else {
    await repository.nativeInsert({ space, name, value: JSON.stringify(value) })
  }
}

const shouldCallOnChange = ({ firstChange, setuped, settings }) => {
  return !firstChange && setuped && (settings.shouldLoad ? settings.loaded : true)
}