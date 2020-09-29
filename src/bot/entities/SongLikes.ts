import { Cascade, Entity, OneToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core'
import { User } from './User'

@Entity({
  tableName: 'songs_likes',
})
@Unique({ name: 'songs_likes_userid_name_unique', properties: ['userId', 'name'] })
export class SongLike {

  @PrimaryKey()
  id!: number;

  @OneToOne({ entity: () => User, fieldName: 'userId', cascade: [Cascade.ALL], nullable: true })
  userId?: User;

  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: 'int8', fieldName: 'createdAt' })
  createdAt!: string;

  @Property({ columnType: 'int8', fieldName: 'updatedAt', nullable: true })
  updatedAt?: string;

}
