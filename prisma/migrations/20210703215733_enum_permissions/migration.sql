CREATE TYPE "CommandPermission" AS ENUM ('VIEWERS', 'FOLLOWERS', 'VIPS', 'SUBSCRIBERS', 'MODERATORS', 'BROADCASTER');

UPDATE "commands" SET "permission"=upper("permission");

ALTER TABLE "commands" ALTER COLUMN "permission" DROP DEFAULT;

ALTER TABLE "commands" ALTER COLUMN "permission" TYPE "CommandPermission" USING "permission"::"CommandPermission";

ALTER TABLE "commands" ALTER COLUMN "permission" SET DEFAULT E'VIEWERS';