import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Users } from './Users'

@Entity()
export class UsersDailyMessages {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => Users, fieldName: 'userId', cascade: [Cascade.ALL], nullable: true })
  userId?: Users;

  @Property({ nullable: true })
  count?: number = 1;

  @Property({ columnType: 'int8' })
  date!: string;

}
