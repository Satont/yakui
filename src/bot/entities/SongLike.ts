import { Entity, PrimaryKey, Property, Unique, ManyToOne } from '@mikro-orm/core';
import { User } from './User';
import MyBigInt from '../customTypes/BigInt';

@Entity({
  tableName: 'songs_likes',
})
@Unique({ name: 'songs_likes_userid_name_unique', properties: ['userId', 'name'] })
export class SongLike {

  @PrimaryKey()
  id!: number;

  @Property()
  userId: number

  @Property({ length: 255 })
  name!: string;

  @Property({ type: MyBigInt })
  createdAt!: number;

  @Property({ nullable: true, type: MyBigInt })
  updatedAt?: number;

  @ManyToOne({ entity: () => User, persist: false })
  user?: User;
}
