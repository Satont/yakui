import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { User } from './User'

@Entity({
  tableName: 'users_tips',
})
export class UsersTips {

  @PrimaryKey()
  id!: number;

  @Property({ columnType: 'float4' })
  amount!: string;

  @Property({ fieldName: 'inMainCurrencyAmount', columnType: 'float4' })
  inMainCurrencyAmount!: string;

  @Property({ columnType: 'json' })
  rates!: Record<string, any>;

  @Property({ length: 255 })
  currency!: string;

  @Property({ columnType: 'text', nullable: true })
  message?: string;

  @Property({ columnType: 'int8' })
  timestamp!: string;

  @ManyToOne({ entity: () => User, fieldName: 'userId', cascade: [Cascade.ALL], nullable: true })
  userId?: User;

}
