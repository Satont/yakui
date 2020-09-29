import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Users } from './Users'

@Entity()
export class UsersBits {

  @PrimaryKey()
  id!: number;

  @Property({ columnType: 'int8' })
  amount!: string;

  @Property({ columnType: 'text', nullable: true })
  message?: string;

  @Property({ columnType: 'int8' })
  timestamp!: string;

  @ManyToOne({ entity: () => Users, fieldName: 'userId', cascade: [Cascade.ALL], nullable: true })
  userId?: Users;

}
