import { setupObserver, cache } from './_observer'

interface OnPropertyChangeConfig {
  history?: boolean;
  bulk?: boolean;
}

const defaultConfig = {
  bulk: false,
  history: false,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ChangeDecorator(props: string | string[], config: OnPropertyChangeConfig = defaultConfig): MethodDecorator {
  const propertyNames = normaliseProps(props)

  return (instance: any, methodName: PropertyKey): void => {
    const instanceName = instance.constructor.name.toLowerCase()

    for (const propertyName of propertyNames) {
      setupObserver({ instance, propertyName })
      cache[instanceName][propertyName].onChange = methodName
    }
  }
}

function normaliseProps(props: string | string[]): string[] {
  if (Array.isArray(props)) {
    return props as unknown as string[]
  } else {
    return [props as unknown as string]
  }
}
