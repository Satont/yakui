import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core'

@Entity()
export class Widgets {

  @PrimaryKey()
  id!: number;

  @Unique({ name: 'widgets_name_unique' })
  @Property({ length: 255 })
  name!: string;

  @Property()
  x!: number;

  @Property()
  y!: number;

  @Property()
  w!: number;

  @Property()
  h!: number;

}
