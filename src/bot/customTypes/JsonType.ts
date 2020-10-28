import { Type } from '@mikro-orm/core'

export default class JsonType extends Type<string, string> {
  convertToDatabaseValue(value: any): string {
    try {
      return JSON.stringify(value)
    } catch (e) {
      console.log(value)
      console.error(e)
    }
  }

  convertToJSValue(value: string): any {
    try {
      return JSON.parse(value)
    } catch (e) {
      console.log(value)
      console.error(e)
    }
  }

  getColumnType() {
    return `text`
  }
}
