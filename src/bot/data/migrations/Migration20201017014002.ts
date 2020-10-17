import { Migration } from '@mikro-orm/migrations';

export class Migration20201017014002 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "timers" add column "messages" int4 null default 0, add column "triggerMessage" int4 null default 0;');
    this.addSql('alter table "timers" drop constraint if exists "timers_interval_check";');
    this.addSql('alter table "timers" alter column "interval" type int4 using ("interval"::int4);');
    this.addSql('alter table "timers" alter column "interval" set default 0;');
    this.addSql('alter table "timers" alter column "interval" drop not null;');
  }

}
