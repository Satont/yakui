import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core'

@Entity()
export class Events {

  @PrimaryKey()
  id!: number;

  @Unique({ name: 'events_name_unique' })
  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: 'json', nullable: true, default: '[]' })
  operations?: object;

}
