import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { User } from './User'

@Entity({
  tableName: 'users_daily_messages',
})
export class UserDailyMessages {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => User, fieldName: 'userId', cascade: [Cascade.ALL], nullable: true })
  userId?: User;

  @Property({ nullable: true })
  count?: number = 1;

  @Property({ columnType: 'int8' })
  date!: string;

}
