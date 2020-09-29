import { Entity, Index, PrimaryKey, Property, Unique } from '@mikro-orm/core'

@Entity()
export class Keywords {

  @PrimaryKey()
  id!: number;

  @Index({ name: 'keywords_name_index' })
  @Unique({ name: 'keywords_name_unique' })
  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: 'text' })
  response!: string;

  @Property({ nullable: true })
  enabled?: boolean = true;

  @Property({ nullable: true })
  cooldown?: number = 30;

}
