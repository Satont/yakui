import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({
  tableName: 'overlays',
})
export class Overlay {

  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: 'text' })
  data!: string;

  @Property({ columnType: 'text', nullable: true })
  css?: string;

  @Property({ columnType: 'json', nullable: true, default: '[]' })
  js?: string[];

}
