import { Migration } from '@mikro-orm/migrations';

export class Migration20201109083550 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "greetings" add column "sound_file_id" int4 null, add column "sound_volume" int4 null;');
    this.addSql('alter table "greetings" drop constraint if exists "greetings_enabled_check";');
    this.addSql('alter table "greetings" alter column "enabled" type bool using ("enabled"::bool);');
    this.addSql('alter table "greetings" alter column "enabled" drop default;');

    this.addSql('alter table "greetings" add constraint "greetings_sound_file_id_foreign" foreign key ("sound_file_id") references "files" ("id") on update cascade on delete set null;');
  }

}
