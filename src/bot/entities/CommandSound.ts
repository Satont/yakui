import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
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

  @ManyToOne({ entity: () => Command, fieldName: 'commandId', cascade: [Cascade.ALL] })
  command!: Command;

  @ManyToOne({ entity: () => File, fieldName: 'soundId', cascade: [Cascade.ALL] })
  file!: File;
}
