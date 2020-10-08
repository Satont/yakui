import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({
  tableName: 'greetings',
})
export class Greeting {

  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  userId?: number;

  @Property({ length: 255, nullable: true })
  username?: string;

  @Property({ columnType: 'text' })
  message!: string;

  @Property({ default: true })
  enabled? = true;

}
