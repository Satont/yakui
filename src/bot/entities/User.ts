import { Entity, Index, PrimaryKey, Property, Unique, OneToOne } from '@mikro-orm/core'
import { UserDailyMessages } from './UserDailyMessages'

@Entity({
  tableName: 'users',
})
export class User {

  @Unique({ name: 'users_id_unique' })
  @PrimaryKey()
  id!: number;

  @Index({ name: 'users_username_index' })
  @Property({ length: 255, nullable: true })
  username?: string;

  @Property({ nullable: true })
  messages?: number;

  @Property({ columnType: 'int8', nullable: true, default: '0' })
  watched?: number;

  @Property({ nullable: true })
  points?: number;

  @Property({ columnType: 'int8', fieldName: 'lastMessagePoints', nullable: true, default: '1' })
  lastMessagePoints?: string;

  @Property({ columnType: 'int8', fieldName: 'lastWatchedPoints', nullable: true, default: '1' })
  lastWatchedPoints?: string;

  @OneToOne()
  dailyMessages?: UserDailyMessages
}
