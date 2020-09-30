import { Type, EntityProperty } from '@mikro-orm/core'

// eslint-disable-next-line @typescript-eslint/ban-types
export default class JsonType extends Type<String, string> {
  convertToDatabaseValue(value: any): string {
    return JSON.stringify(value)
  }

  convertToJSValue(value: string): any {
    return JSON.parse(value)
  }

  getColumnType(prop: EntityProperty) {
    return `myJson(${prop.length})`
  }
}