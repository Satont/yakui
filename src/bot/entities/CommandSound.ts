import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Command } from './Command'
import { File } from './File'

@Entity({
  tableName: 'commands_sound',
})
export class CommandSound {

  @PrimaryKey()
  id!: number;

  @Property()
  volume?: number = 50;

  @Property()
  commandId!: number

  @ManyToOne({ entity: () => Command, fieldName: 'commandId' })
  command!: Command;

  @ManyToOne({ entity: () => File, fieldName: 'soundId' })
  file!: File;
}
