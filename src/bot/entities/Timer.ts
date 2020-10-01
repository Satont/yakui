import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import MyBigInt from '../customTypes/BigInt'

@Entity({
  tableName: 'timers',
})
export class Timer {

  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ nullable: true, default: true })
  enabled?: boolean = true;

  @Property()
  interval!: number;

  @Property({ columnType: 'json', nullable: true, default: '[]' })
  responses?: string[];

  @Property({ nullable: true })
  last?: number;

  @Property({ nullable: true, default: '0', type: MyBigInt })
  triggerTimeStamp?: number;
}
