import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Users } from './Users'

@Entity()
export class UsersTips {

  @PrimaryKey()
  id!: number;

  @Property({ columnType: 'float4' })
  amount!: string;

  @Property({ fieldName: 'inMainCurrencyAmount', columnType: 'float4' })
  inMainCurrencyAmount!: string;

  @Property({ columnType: 'json' })
  rates!: object;

  @Property({ length: 255 })
  currency!: string;

  @Property({ columnType: 'text', nullable: true })
  message?: string;

  @Property({ columnType: 'int8' })
  timestamp!: string;

  @ManyToOne({ entity: () => Users, fieldName: 'userId', cascade: [Cascade.ALL], nullable: true })
  userId?: Users;

}
