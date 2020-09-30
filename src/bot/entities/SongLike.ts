import { Cascade, Entity, OneToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core'
import MyBigInt from '../customTypes/BigInt'
import { User } from './User'

@Entity({
  tableName: 'songs_likes',
})
@Unique({ name: 'songs_likes_userid_name_unique', properties: ['userId', 'name'] })
export class SongLike {

  @PrimaryKey()
  id!: number;

  @Property()
  userId: number

  @OneToOne({ entity: () => User, fieldName: 'userId', cascade: [Cascade.ALL], nullable: true })
  user?: User;

  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: 'int8', fieldName: 'createdAt', type: MyBigInt })
  createdAt!: number;

  @Property({ columnType: 'int8', fieldName: 'updatedAt', nullable: true, type: MyBigInt })
  updatedAt?: number;

}
