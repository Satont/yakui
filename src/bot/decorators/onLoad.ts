import { loaded } from '../libs/loader'

export function OnLoadedDecorator(): MethodDecorator {
  return (instance: any, methodName: PropertyKey): void => {
    const bootstrap = () => {
      if (!loaded) return setTimeout(() => bootstrap(), 1000)
      instance[methodName]()
    }

    bootstrap()
  }
}
