import { Cascade, Entity, OneToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core'
import { Users } from './Users'

@Entity()
@Unique({ name: 'songs_likes_userid_name_unique', properties: ['userId', 'name'] })
export class SongsLikes {

  @PrimaryKey()
  id!: number;

  @OneToOne({ entity: () => Users, fieldName: 'userId', cascade: [Cascade.ALL], nullable: true })
  userId?: Users;

  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: 'int8', fieldName: 'createdAt' })
  createdAt!: string;

  @Property({ columnType: 'int8', fieldName: 'updatedAt', nullable: true })
  updatedAt?: string;

}
