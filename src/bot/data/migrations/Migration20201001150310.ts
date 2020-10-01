import { Migration } from '@mikro-orm/migrations';

export class Migration20201001143517 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "variables" drop constraint if exists "variables_enabled_check";');
    this.addSql('alter table "variables" alter column "enabled" drop default;');
    this.addSql('alter table "variables" alter column "enabled" type bool using ("enabled"::bool);');
    this.addSql('alter table "variables" alter column "enabled" set default true;');

    this.addSql('alter table "users" drop constraint if exists "users_messages_check";');
    this.addSql('alter table "users" alter column "messages" drop default;');
    this.addSql('alter table "users" alter column "messages" type int4 using ("messages"::int4);');
    this.addSql('alter table "users" alter column "messages" set default 0;');
    this.addSql('alter table "users" drop constraint if exists "users_watched_check";');
    this.addSql('alter table "users" alter column "watched" drop default;');
    this.addSql('alter table "users" alter column "watched" type int8 using ("watched"::int8);');
    this.addSql('alter table "users" alter column "watched" set default 0;');
    this.addSql('alter table "users" drop constraint if exists "users_points_check";');
    this.addSql('alter table "users" alter column "points" drop default;');
    this.addSql('alter table "users" alter column "points" type int4 using ("points"::int4);');
    this.addSql('alter table "users" alter column "points" set default 0;');
    this.addSql('alter table "users" drop constraint if exists "users_lastMessagePoints_check";');
    this.addSql('alter table "users" alter column "lastMessagePoints" drop default;');
    this.addSql('alter table "users" alter column "lastMessagePoints" type int8 using ("lastMessagePoints"::int8);');
    this.addSql('alter table "users" alter column "lastMessagePoints" set default 0;');
    this.addSql('alter table "users" drop constraint if exists "users_lastWatchedPoints_check";');
    this.addSql('alter table "users" alter column "lastWatchedPoints" drop default;');
    this.addSql('alter table "users" alter column "lastWatchedPoints" type int8 using ("lastWatchedPoints"::int8);');
    this.addSql('alter table "users" alter column "lastWatchedPoints" set default 0;');

    this.addSql('alter table "users_daily_messages" drop constraint if exists "users_daily_messages_count_check";');
    this.addSql('alter table "users_daily_messages" alter column "count" drop default;');
    this.addSql('alter table "users_daily_messages" alter column "count" type int4 using ("count"::int4);');
    this.addSql('alter table "users_daily_messages" alter column "count" set default 0;');

    this.addSql('alter table "timers" drop constraint if exists "timers_enabled_check";');
    this.addSql('alter table "timers" alter column "enabled" drop default;');
    this.addSql('alter table "timers" alter column "enabled" type bool using ("enabled"::bool);');
    this.addSql('alter table "timers" alter column "enabled" set default true;');
    this.addSql('alter table "timers" drop constraint if exists "timers_last_check";');
    this.addSql('alter table "timers" alter column "last" drop default;');
    this.addSql('alter table "timers" alter column "last" type int4 using ("last"::int4);');
    this.addSql('alter table "timers" alter column "last" set default 0;');

    this.addSql('alter table "songs_likes" drop constraint if exists "songs_likes_userId_check";');
    this.addSql('alter table "songs_likes" alter column "userId" type int4 using ("userId"::int4);');
    this.addSql('alter table "songs_likes" alter column "userId" set not null;');

    this.addSql('alter table "keywords" drop constraint if exists "keywords_enabled_check";');
    this.addSql('alter table "keywords" alter column "enabled" drop default;');
    this.addSql('alter table "keywords" alter column "enabled" type bool using ("enabled"::bool);');
    this.addSql('alter table "keywords" alter column "enabled" set default true;');
    this.addSql('alter table "keywords" drop constraint if exists "keywords_cooldown_check";');
    this.addSql('alter table "keywords" alter column "cooldown" drop default;');
    this.addSql('alter table "keywords" alter column "cooldown" type int4 using ("cooldown"::int4);');
    this.addSql('alter table "keywords" alter column "cooldown" set default 30;');

    this.addSql('alter table "greetings" drop constraint if exists "greetings_enabled_check";');
    this.addSql('alter table "greetings" alter column "enabled" drop default;');
    this.addSql('alter table "greetings" alter column "enabled" type bool using ("enabled"::bool);');
    this.addSql('alter table "greetings" alter column "enabled" set default true;');

    this.addSql('alter table "commands" add column "sound_file_id" int4 null, add column "sound_volume" int4 null;');
    this.addSql('alter table "commands" drop constraint if exists "commands_aliases_check";');
    this.addSql('alter table "commands" alter column "aliases" drop default;');
    this.addSql('alter table "commands" alter column "aliases" type json using ("aliases"::json);');
    this.addSql('alter table "commands" alter column "aliases" set default \'[]\';');
    this.addSql('alter table "commands" drop constraint if exists "commands_enabled_check";');
    this.addSql('alter table "commands" alter column "enabled" drop default;');
    this.addSql('alter table "commands" alter column "enabled" type bool using ("enabled"::bool);');
    this.addSql('alter table "commands" alter column "enabled" set default true;');
    this.addSql('alter table "commands" alter column "enabled" set not null;');
    this.addSql('alter table "commands" drop constraint if exists "commands_visible_check";');
    this.addSql('alter table "commands" alter column "visible" drop default;');
    this.addSql('alter table "commands" alter column "visible" type bool using ("visible"::bool);');
    this.addSql('alter table "commands" alter column "visible" set default true;');
    this.addSql('alter table "commands" drop constraint if exists "commands_permission_check";');
    this.addSql('alter table "commands" alter column "permission" type text using ("permission"::text);');
    this.addSql('alter table "commands" add constraint "commands_permission_check" check ("permission" in (\'viewers\', \'followers\', \'vips\', \'subscribers\', \'moderators\', \'broadcaster\'));');
    this.addSql('alter table "commands" alter column "permission" drop default;');
    this.addSql('alter table "commands" drop constraint if exists "commands_price_check";');
    this.addSql('alter table "commands" alter column "price" drop default;');
    this.addSql('alter table "commands" alter column "price" type int4 using ("price"::int4);');
    this.addSql('alter table "commands" alter column "price" set default 0;');
    this.addSql('alter table "commands" drop constraint if exists "commands_usage_check";');
    this.addSql('alter table "commands" alter column "usage" drop default;');
    this.addSql('alter table "commands" alter column "usage" type int4 using ("usage"::int4);');
    this.addSql('alter table "commands" alter column "usage" set default 0;');

    this.addSql('drop table "commands_sound"')
  }

}
