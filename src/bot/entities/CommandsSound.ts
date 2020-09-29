import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Commands } from './Commands'
import { Files } from './Files'

@Entity()
export class CommandsSound {

  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  volume?: number = 50;

  @ManyToOne({ entity: () => Commands, fieldName: 'commandId', cascade: [Cascade.ALL], nullable: true })
  commandId?: Commands;

  @ManyToOne({ entity: () => Files, fieldName: 'soundId', cascade: [Cascade.ALL], nullable: true })
  soundId?: Files;

}
