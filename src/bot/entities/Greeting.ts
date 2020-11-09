import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { File } from './File'

@Entity({
  tableName: 'greetings',
})
export class Greeting {
  @PrimaryKey()
  id!: number;

  @Property()
  userId?: number

  @Property({ length: 255 })
  username?: string

  @Property({ columnType: 'text' })
  message!: string

  @Property()
  enabled? = true

  @ManyToOne({ fieldName: 'sound_file_id' })
  sound_file?: File

  @Property()
  sound_volume?: number
}
