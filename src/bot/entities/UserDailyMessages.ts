import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import MyBigInt from '../customTypes/BigInt'
import { User } from './User'

@Entity({
  tableName: 'users_daily_messages',
})
export class UserDailyMessages {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: true, default: 0 })
  count?: number = 0;
  
  @Property({ type: MyBigInt })
  date!: number;
  
  @ManyToOne({ entity: () => User, fieldName: 'userId' })
  user!: User;
}
