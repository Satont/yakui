import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import MyBigInt from '../customTypes/BigInt';
import { User } from './User';

@Entity({
  tableName: 'users_tips',
})
export class UserTip {

  @PrimaryKey()
  id!: number;

  @Property({ columnType: 'float4' })
  amount!: number;

  @Property({ columnType: 'float4' })
  inMainCurrencyAmount!: number;

  @Property({ columnType: 'json' })
  rates!: Record<string, number>;

  @Property({ length: 255 })
  currency!: string;

  @Property({ columnType: 'text', nullable: true })
  message?: string;

  @Property({ type: MyBigInt })
  timestamp!: number;

  @ManyToOne({ entity: () => User, fieldName: 'userId', nullable: true })
  user?: User;
}
