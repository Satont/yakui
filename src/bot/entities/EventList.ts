import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import MyBigInt from '../customTypes/BigInt';

@Entity({
  tableName: 'eventlist',
})
export class EventList {
  @PrimaryKey()
  id!: number

  @Property({ length: 255 })
  name!: string

  @Property({ columnType: 'json' })
  data!: Record<string, any>

  @Property({ type: MyBigInt })
  timestamp!: number
}
