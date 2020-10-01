import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import MyBigInt from '../customTypes/BigInt'
import { User } from './User'

@Entity({
  tableName: 'users_bits',
})
export class UserBit {
  @PrimaryKey()
  id!: number;

  @Property({ type: MyBigInt })
  amount!: number;

  @Property({ columnType: 'text', nullable: true })
  message?: string;

  @Property({ type: MyBigInt })
  timestamp!: number;

  @ManyToOne({ entity: () => User, fieldName: 'userId' })
  user!: User;
}
