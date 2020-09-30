import { Entity, Index, PrimaryKey, Property, Unique, OneToOne, OneToMany, Collection } from '@mikro-orm/core'
import { UserBit } from './UserBit'
import { UserDailyMessages } from './UserDailyMessages'
import { UserTip } from './UserTip'

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

  @OneToMany(() => UserBit, bit => bit.user)
  bits? = new Collection<UserBit>(this);

  @OneToMany(() => UserTip, tip => tip.user)
  tips? = new Collection<UserBit>(this);
}
