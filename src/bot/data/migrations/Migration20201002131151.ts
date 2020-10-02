import { Migration } from '@mikro-orm/migrations';

export class Migration20201002131151 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "users_bits" drop constraint if exists "users_bits_userId_check";');
    this.addSql('alter table "users_bits" alter column "userId" type int4 using ("userId"::int4);');
    this.addSql('alter table "users_bits" alter column "userId" set not null;');

    this.addSql('alter table "users_daily_messages" drop constraint if exists "users_daily_messages_userId_check";');
    this.addSql('alter table "users_daily_messages" alter column "userId" type int4 using ("userId"::int4);');
    this.addSql('alter table "users_daily_messages" alter column "userId" set not null;');
  }

}
