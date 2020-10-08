import { Type } from '@mikro-orm/core'

export default class JsonType extends Type<string, string> {
  convertToDatabaseValue(value: any): string {
    return JSON.stringify(value)
  }

  convertToJSValue(value: string): any {
    return JSON.parse(value)
  }

  getColumnType() {
    return `text`
  }
}
