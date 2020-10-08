import { Migration } from '@mikro-orm/migrations'

export class Migration20201001204451 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "commands" rename column "sound_file" to "sound_file_id";')
  }

}
