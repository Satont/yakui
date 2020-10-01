import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import MyBigInt from '../customTypes/BigInt'
import { User } from './User'

@Entity({
  tableName: 'users_tips',
})
export class UserTip {

  @PrimaryKey()
  id!: number;

  @Property({ columnType: 'float4' })
  amount!: string;

  @Property({ columnType: 'float4' })
  inMainCurrencyAmount!: string;

  @Property({ columnType: 'json' })
  rates!: Record<string, any>;

  @Property({ length: 255 })
  currency!: string;

  @Property({ columnType: 'text', nullable: true })
  message?: string;

  @Property({ type: MyBigInt })
  timestamp!: number;

  @Property()
  userId?: number

  @ManyToOne({ entity: () => User, nullable: true, persist: false })
  user?: User;
}
