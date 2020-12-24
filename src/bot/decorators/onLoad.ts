import { loaded, loadedSystems } from '../libs/loader'

export function OnLoadedDecorator(): MethodDecorator {
  return (instance: any, methodName: PropertyKey): void => {
    const bootstrap = async () => {
      const module = loadedSystems.find(s => s.constructor.name.toLowerCase() === instance.constructor.name.toLowerCase())
      if (!module || !loaded) return setTimeout(() => bootstrap(), 1000)

      await module[methodName]()
    }
    bootstrap()
  }
}
