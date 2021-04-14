import { Entity, Index, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity({
  tableName: 'keywords',
})
export class Keyword {

  @PrimaryKey()
  id!: number;

  @Index({ name: 'keywords_name_index' })
  @Unique({ name: 'keywords_name_unique' })
  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: 'text' })
  response!: string;

  @Property({ default: true })
  enabled? = true;

  @Property({ default: 30 })
  cooldown? = 30;

}
