import { Migration } from '@mikro-orm/migrations';

export class Migration20201001203327 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "variables" drop constraint if exists "variables_enabled_check";');
    this.addSql('alter table "variables" alter column "enabled" type bool using ("enabled"::bool);');
    this.addSql('alter table "variables" alter column "enabled" drop default;');

    this.addSql('alter table "timers" drop constraint if exists "timers_last_check";');
    this.addSql('alter table "timers" alter column "last" type int4 using ("last"::int4);');
    this.addSql('alter table "timers" alter column "last" drop default;');

    this.addSql('alter table "commands" drop column "sound_file_id"');
    this.addSql('alter table "commands" add column "sound_file" int4 null;');

    this.addSql('alter table "commands" add constraint "commands_sound_file_foreign" foreign key ("sound_file") references "files" ("id") on update cascade on delete set null;');
  }

}
