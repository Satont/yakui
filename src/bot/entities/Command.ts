import { Entity, Enum, PrimaryKey, Property, Unique, ManyToOne } from '@mikro-orm/core';
import { File } from './File';

@Entity({
  tableName: 'commands',
})
export class Command {
  @PrimaryKey()
  id!: number;

  @Unique({ name: 'commands_name_unique' })
  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: 'json', default: '[]' })
  aliases?: string[] = [];

  @Property({ default: 10 })
  cooldown?: number = 10;

  @Property()
  description?: string;

  @Property()
  response!: string;

  @Property({ default: true })
  enabled = true;

  @Property({ default: true })
  visible = true;

  @Enum({ default: 'viewers' })
  permission: CommandPermission = CommandPermission.VIEWERS;

  @Property({ default: 0 })
  price?: number = 0;

  @Property({ default: 0 })
  usage?: number = 0;

  @ManyToOne({ fieldName: 'sound_file_id' })
  sound_file?: File;

  @Property()
  sound_volume?: number;
}

export enum CommandPermission {
  VIEWERS = 'viewers',
  FOLLOWERS = 'followers',
  VIPS = 'vips',
  SUBSCRIBERS = 'subscribers',
  MODERATORS = 'moderators',
  BROADCASTER = 'broadcaster',
}
