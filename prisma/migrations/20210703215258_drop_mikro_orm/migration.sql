/*
  Warnings:

  - You are about to drop the `mikro_orm_migrations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "mikro_orm_migrations";

-- AlterIndex
ALTER INDEX "commands_name_unique" RENAME TO "commands.name_unique";

-- AlterIndex
ALTER INDEX "events_name_unique" RENAME TO "events.name_unique";

-- AlterIndex
ALTER INDEX "keywords_name_unique" RENAME TO "keywords.name_unique";

-- AlterIndex
ALTER INDEX "widgets_name_unique" RENAME TO "widgets.name_unique";
