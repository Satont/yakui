import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({
  tableName: 'files',
})
export class File {

  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255 })
  type!: string;

  @Property({ columnType: 'text' })
  data!: string;

}
