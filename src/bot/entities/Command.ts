import { Entity, Enum, PrimaryKey, Property, Unique, OneToOne } from '@mikro-orm/core'
import { File } from './File'

@Entity({
  tableName: 'commands',
})
export class Command {
  @PrimaryKey()
  id!: number
  
  @Unique({ name: 'commands_name_unique' })
  @Property({ length: 255 })
  name!: string
  
  @Property({ columnType: 'json' })
  aliases?: string[] = []
  
  @Property()
  cooldown?: number = 10

  @Property()
  description?: string

  @Property()
  response!: string
  
  @Property()
  enabled = true
  
  @Property()
  visible = true
  
  @Enum()
  permission!: CommandPermission
  
  @Property()
  price?: number = 0
  
  @Property()
  usage?: number = 0
  
  @Property({ unique: false })
  sound_file_id?: number
  
  @Property()
  sound_volume?: number
  
  @OneToOne({ fieldName: 'sound_file_id', persist: false })
  sound_file?: File
}

export enum CommandPermission {
  VIEWERS = 'viewers',
  FOLLOWERS = 'followers',
  VIPS = 'vips',
  SUBSCRIBERS = 'subscribers',
  MODERATORS = 'moderators', 
  BROADCASTER = 'broadcaster'
}