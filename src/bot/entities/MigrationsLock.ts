import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class MigrationsLock {

  @PrimaryKey()
  index!: number;

  @Property({ nullable: true })
  isLocked?: number;

}
