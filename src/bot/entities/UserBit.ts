import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { User } from './User'

@Entity({
  tableName: 'users_bits',
})
export class UserBit {
  @PrimaryKey()
  id!: number;

  @Property({ columnType: 'int8' })
  amount!: string;

  @Property({ columnType: 'text', nullable: true })
  message?: string;

  @Property({ columnType: 'int8' })
  timestamp!: string;

  @ManyToOne({ entity: () => User, fieldName: 'userId', cascade: [Cascade.ALL], nullable: true })
  user?: User;
}
