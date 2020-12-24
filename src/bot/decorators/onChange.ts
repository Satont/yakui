import { setupObserver, cache } from './_observer'

interface OnPropertyChangeConfig {
  history?: boolean;
  bulk?: boolean;
}

export interface IOnChangeOpts {
  oldValue: any,
  newValue: any,
  property: string
}

const defaultConfig = {
  bulk: false,
  history: false,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ChangeDecorator(props: string | string[], config: OnPropertyChangeConfig = defaultConfig): MethodDecorator {
  const propertyNames = Array.isArray(props) ? [...props] : [props]

  return (instance: any, methodName: PropertyKey): void => {
    const instanceName = instance.constructor.name.toLowerCase()

    for (const propertyName of propertyNames) {
      setupObserver({ instance, propertyName });

      (cache[instanceName][propertyName as any].onChange as any) = methodName
    }
  }
}
