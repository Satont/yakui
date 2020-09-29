import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Timers {

  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ nullable: true })
  enabled?: boolean = true;

  @Property()
  interval!: number;

  @Property({ columnType: 'json', nullable: true, default: '[]' })
  responses?: object;

  @Property({ nullable: true })
  last?: number;

  @Property({ columnType: 'int8', fieldName: 'triggerTimeStamp', nullable: true, default: '0' })
  triggerTimeStamp?: string;

}
