import { orm } from '../libs/db'
import { loadedSystems } from '../libs/loader'
import { Settings as SettingsModel } from '../entities/Settings'
import { setupObserver } from './_observer'

export function SettingsDecorator() {
  return (clazz: any, name: string) => {
    setupObserver({ instance: clazz, propertyName: name })
    const space = clazz.constructor.name.toLowerCase()
    const load = async() => {
      const module = loadedSystems.find(s => s.constructor.name.toLowerCase() === space)
      if (!loadedSystems.length || !module) return setTimeout(() => load(), 1000)

      const repository = orm.em.getRepository(SettingsModel)
      let item = await repository.findOne({ space, name })

      if (!item) {
        item = repository.assign(new SettingsModel(), { space, name, value: module[name] })
        await repository.persistAndFlush(item)
      }

      module[name] = item.value
    }
    load()
  }
}
