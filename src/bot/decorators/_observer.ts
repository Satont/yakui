import { orm } from '../libs/db'
import { Settings } from '../entities/Settings'

export const cache: ICache = {}

type TVariable = {
  value: any,
  previousValue: any,
  firstChange: boolean,
  onChange: string,
  settings: {
    shouldLoad: boolean,
    loaded: boolean,
  }
}

interface ICache {
  [x: string]: Record<string, TVariable>
}

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

        const shouldCallChange = shouldCallOnChange(cache[instanceName][propertyName])

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
  const item = await repository.findOne({ space, name }) || repository.create({ space, name })
  item.value = value
  await repository.persistAndFlush(item)
}

const shouldCallOnChange = (varCache: TVariable) => {
  return !varCache.firstChange && (varCache.settings.shouldLoad ? varCache.settings.loaded : true) && varCache.onChange
}
