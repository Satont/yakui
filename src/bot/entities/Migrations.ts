import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Migrations {

  @PrimaryKey()
  id!: number;

  @Property({ length: 255, nullable: true })
  name?: string;

  @Property({ nullable: true })
  batch?: number;

  @Property({ length: 6, nullable: true })
  migrationTime?: Date;

}
