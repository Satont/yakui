import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import MyBigInt from '../customTypes/BigInt'

@Entity({
  tableName: 'timers',
})
export class Timer {
  @PrimaryKey()
  id!: number

  @Property({ length: 255 })
  name!: string

  @Property({ nullable: true, default: true })
  enabled?: boolean = true

  @Property({ default: 0 })
  interval?: number = 0

  @Property({ default: 0 })
  messages?: number = 0

  @Property({ columnType: 'json', nullable: true, default: '[]' })
  responses?: string[]

  @Property({ nullable: true })
  last?: number

  @Property({ nullable: true, default: '0', type: MyBigInt })
  triggerTimeStamp?: number

  @Property({ default: 0 })
  triggerMessage?: number = 0
}
