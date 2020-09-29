import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({
  tableName: 'eventlist',
})
export class Eventlist {
  @PrimaryKey()
  id!: number

  @Property({ length: 255 })
  name!: string

  @Property({ columnType: 'json' })
  data!: Record<string, any>

  @Property({ columnType: 'int8' })
  timestamp!: string
}
