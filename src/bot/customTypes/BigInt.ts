import { Type } from '@mikro-orm/core'

// eslint-disable-next-line @typescript-eslint/ban-types
export default class MyBigInt extends Type<Number, string> {
  convertToDatabaseValue(v: number) {
    return String(v)
  }

  convertToJSValue(v: string) {
    return Number(String(v))
  }

  getColumnType() {
    return `int8`
  }
}