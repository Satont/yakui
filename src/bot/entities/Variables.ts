import { Entity, Index, PrimaryKey, Property, Unique } from '@mikro-orm/core'

@Entity()
export class Variables {

  @PrimaryKey()
  id!: number;

  @Index({ name: 'variables_name_index' })
  @Unique({ name: 'variables_name_unique' })
  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: 'text' })
  response!: string;

  @Property({ nullable: true })
  enabled?: boolean = true;

}
