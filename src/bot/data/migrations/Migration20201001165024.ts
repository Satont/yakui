import { Migration } from '@mikro-orm/migrations';

export class Migration20201001165024 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "widgets" ("id" serial primary key, "name" varchar(255) not null, "x" int4 not null, "y" int4 not null, "w" int4 not null, "h" int4 not null);');
    this.addSql('alter table "widgets" add constraint "widgets_name_unique" unique ("name");');

    this.addSql('create table "variables" ("id" serial primary key, "name" varchar(255) not null, "response" text not null, "enabled" bool null);');
    this.addSql('create index "variables_name_index" on "variables" ("name");');
    this.addSql('alter table "variables" add constraint "variables_name_unique" unique ("name");');

    this.addSql('create table "users" ("id" serial primary key, "username" varchar(255) null, "messages" int4 null, "watched" int8 null default \'0\', "points" int4 null, "lastMessagePoints" int8 null default \'1\', "lastWatchedPoints" int8 null default \'1\');');
    this.addSql('create index "users_username_index" on "users" ("username");');

    this.addSql('create table "users_bits" ("id" serial primary key, "amount" int8 not null, "message" text null, "timestamp" int8 not null, "userId" int4 null);');

    this.addSql('create table "users_daily_messages" ("id" serial primary key, "userId" int4 null, "count" int4 null, "date" int8 not null);');

    this.addSql('create table "users_tips" ("id" serial primary key, "amount" float4 not null, "inMainCurrencyAmount" float4 not null, "rates" json not null, "currency" varchar(255) not null, "message" text null, "timestamp" int8 not null, "userId" int4 null);');

    this.addSql('create table "timers" ("id" serial primary key, "name" varchar(255) not null, "enabled" bool null, "interval" int4 not null, "responses" json null default \'[]\', "last" int4 null, "triggerTimeStamp" int8 null default \'0\');');

    this.addSql('create table "settings" ("id" serial primary key, "space" varchar(255) not null, "name" varchar(255) not null, "value" text not null);');

    this.addSql('create table "overlays" ("id" serial primary key, "name" varchar(255) not null, "data" text not null, "css" text null, "js" json null default \'[]\');');

    this.addSql('create table "migrations_lock" ("index" serial primary key, "is_locked" int4 null);');

    this.addSql('create table "migrations" ("id" serial primary key, "name" varchar(255) null, "batch" int4 null, "migration_time" timestamptz(6) null);');

    this.addSql('create table "keywords" ("id" serial primary key, "name" varchar(255) not null, "response" text not null, "enabled" bool null, "cooldown" int4 null);');
    this.addSql('create index "keywords_name_index" on "keywords" ("name");');
    this.addSql('alter table "keywords" add constraint "keywords_name_unique" unique ("name");');

    this.addSql('create table "greetings" ("id" serial primary key, "userId" int4 null, "username" varchar(255) null, "message" text not null, "enabled" bool null);');

    this.addSql('create table "files" ("id" serial primary key, "name" varchar(255) not null, "type" varchar(255) not null, "data" text not null);');

    this.addSql('create table "events" ("id" serial primary key, "name" varchar(255) not null, "operations" json null default \'[]\');');
    this.addSql('alter table "events" add constraint "events_name_unique" unique ("name");');

    this.addSql('create table "eventlist" ("id" serial primary key, "name" varchar(255) not null, "data" json not null, "timestamp" int8 not null);');

    this.addSql('create table "commands" ("id" serial primary key, "name" varchar(255) not null, "aliases" json null default \'[]\', "cooldown" int4 null, "description" text null, "response" text not null, "enabled" text null default \'true\', "visible" bool not null, "permission" text not null default \'viewers\', "price" int4 null, "usage" int4 null);');
    this.addSql('alter table "commands" add constraint "commands_name_unique" unique ("name");');

    this.addSql('create table "command_sound" ("id" serial primary key, "volume" int4 null, "commandId" int4 null, "soundId" int4 null);');

    this.addSql('alter table "users_bits" add constraint "users_bits_userid_foreign" foreign key ("userId") references "users" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "users_daily_messages" add constraint "usersdailymessages_userid_foreign" foreign key ("userId") references "users" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "users_tips" add constraint "users_tips_userid_foreign" foreign key ("userId") references "users" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "command_sound" add constraint "commands_sounds_commandid_foreign" foreign key ("commandId") references "commands" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "command_sound" add constraint "commands_sounds_soundid_foreign" foreign key ("soundId") references "files" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "settings" add constraint "settings_space_name_unique" unique ("space", "name");');
  }

}
