import { Type } from '@mikro-orm/core'

export default class MyBigInt extends Type<number, string> {
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
