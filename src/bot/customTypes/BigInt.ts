import { BigIntType  } from '@mikro-orm/core'

// eslint-disable-next-line @typescript-eslint/ban-types
export default class MyBigInt extends BigIntType {
  convertToJSValue(value: string): any {
    return Number(value)
  }
}