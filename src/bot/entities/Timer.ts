import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({
  tableName: 'timers',
})
export class Timer {

  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ nullable: true })
  enabled?: boolean = true;

  @Property()
  interval!: number;

  @Property({ columnType: 'json', nullable: true, default: '[]' })
  responses?: Record<string, any>;

  @Property({ nullable: true })
  last?: number;

  @Property({ columnType: 'int8', fieldName: 'triggerTimeStamp', nullable: true, default: '0' })
  triggerTimeStamp?: string;

}
