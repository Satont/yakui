/*
  Warnings:

  - The values [VIEWERS,FOLLOWERS,VIPS,SUBSCRIBERS,MODERATORS] on the enum `CommandPermission` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[userId,date]` on the table `users_daily_messages` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CommandPermission_new" AS ENUM ('VIEWER', 'FOLLOWER', 'VIP', 'SUBSCRIBER', 'MODERATOR', 'BROADCASTER');
ALTER TABLE "commands" ALTER COLUMN "permission" DROP DEFAULT;
ALTER TABLE "commands" ALTER COLUMN "permission" TYPE "CommandPermission_new" USING ("permission"::text::"CommandPermission_new");
ALTER TYPE "CommandPermission" RENAME TO "CommandPermission_old";
ALTER TYPE "CommandPermission_new" RENAME TO "CommandPermission";
DROP TYPE "CommandPermission_old";
ALTER TABLE "commands" ALTER COLUMN "permission" SET DEFAULT 'VIEWER';
COMMIT;

-- AlterTable
ALTER TABLE "commands" ALTER COLUMN "permission" SET DEFAULT E'VIEWER';

-- CreateIndex
CREATE UNIQUE INDEX "users_daily_messages_userid_name_unique" ON "users_daily_messages"("userId", "date");
