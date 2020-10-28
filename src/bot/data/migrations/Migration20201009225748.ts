import { Migration } from '@mikro-orm/migrations';

export class Migration20201009225748 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "settings" drop constraint if exists "settings_value_check";');
    this.addSql('alter table "settings" alter column "value" type text using ("value"::text);');
    this.addSql('alter table "settings" alter column "value" drop not null;');
  }

}
