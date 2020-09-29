import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core'

@Entity()
@Unique({ name: 'settings_space_name_unique', properties: ['space', 'name'] })
export class Settings {

  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  space!: string;

  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: 'text' })
  value!: string;

}
