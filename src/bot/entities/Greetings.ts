import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Greetings {

  @PrimaryKey()
  id!: number;

  @Property({ fieldName: 'userId', nullable: true })
  userId?: number;

  @Property({ length: 255, nullable: true })
  username?: string;

  @Property({ columnType: 'text' })
  message!: string;

  @Property({ nullable: true })
  enabled?: boolean = true;

}
