import { loaded } from '../libs/loader'

export function OnLoadedDecorator(): MethodDecorator {
  return (instance: any, methodName: PropertyKey): void => {
    const bootstrap = async () => {
      if (!loaded) return setTimeout(() => bootstrap(), 1000)
      await instance[methodName]()
    }

    bootstrap()
  }
}
