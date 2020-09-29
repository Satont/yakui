import { Entity, Enum, PrimaryKey, Property, Unique, OneToOne } from '@mikro-orm/core'
/* import { CommandPermission } from 'typings' */
import { CommandSound } from './CommandSound'

@Entity({
  tableName: 'commands',
})
export class Command {
  @PrimaryKey()
  id!: number

  @Unique({ name: 'commands_name_unique' })
  @Property({ length: 255 })
  name!: string

  @Property()
  aliases?: string[] = []

  @Property()
  cooldown?: number = 10

  @Property({ columnType: 'text', nullable: true })
  description?: string

  @Property({ columnType: 'text' })
  response!: string

  @Property()
  enabled = true

  @Property()
  visible = true

  @Enum()
  permission!: any

  @Property()
  price?: number = 0

  @Property({ nullable: true })
  usage?: number = 1
  
  @OneToOne()
  sound?: CommandSound
}

