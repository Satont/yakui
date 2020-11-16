import { Migration } from '@mikro-orm/migrations';

export class Migration20201113111531 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "users" add column "isSubscriber" bool not null default false, add column "isModerator" bool not null default false, add column "isVip" bool not null default false;');
  }

}
