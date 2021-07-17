-- CreateTable
CREATE TABLE "commands" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "aliases" JSON DEFAULT E'[]',
    "cooldown" INTEGER DEFAULT 10,
    "description" TEXT,
    "response" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "permission" TEXT NOT NULL DEFAULT E'viewers',
    "price" INTEGER DEFAULT 0,
    "usage" INTEGER DEFAULT 0,
    "sound_volume" INTEGER,
    "sound_file_id" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventlist" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "data" JSON NOT NULL,
    "timestamp" BIGINT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "operations" JSON DEFAULT E'[]',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "data" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "greetings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "username" VARCHAR(255),
    "message" TEXT NOT NULL,
    "enabled" BOOLEAN,
    "sound_file_id" INTEGER,
    "sound_volume" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywords" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "response" TEXT NOT NULL,
    "enabled" BOOLEAN DEFAULT true,
    "cooldown" INTEGER DEFAULT 30,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mikro_orm_migrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "executed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overlays" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "data" TEXT NOT NULL,
    "css" TEXT,
    "js" JSON DEFAULT E'[]',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "space" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "songs_likes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" BIGINT NOT NULL,
    "updatedAt" BIGINT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "enabled" BOOLEAN DEFAULT true,
    "interval" INTEGER DEFAULT 0,
    "responses" JSON DEFAULT E'[]',
    "last" INTEGER,
    "triggerTimeStamp" BIGINT DEFAULT 0,
    "messages" INTEGER DEFAULT 0,
    "triggerMessage" INTEGER DEFAULT 0,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL,
    "username" VARCHAR(255),
    "messages" INTEGER DEFAULT 0,
    "watched" BIGINT DEFAULT 0,
    "points" INTEGER DEFAULT 0,
    "lastMessagePoints" BIGINT DEFAULT 0,
    "lastWatchedPoints" BIGINT DEFAULT 0,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_bits" (
    "id" SERIAL NOT NULL,
    "amount" BIGINT NOT NULL,
    "message" TEXT,
    "timestamp" BIGINT NOT NULL,
    "userId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_daily_messages" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "count" INTEGER DEFAULT 0,
    "date" BIGINT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_tips" (
    "id" SERIAL NOT NULL,
    "amount" REAL NOT NULL,
    "inMainCurrencyAmount" REAL NOT NULL,
    "rates" JSON NOT NULL,
    "currency" VARCHAR(255) NOT NULL,
    "message" TEXT,
    "timestamp" BIGINT NOT NULL,
    "userId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variables" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "response" TEXT NOT NULL,
    "enabled" BOOLEAN,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widgets" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "w" INTEGER NOT NULL,
    "h" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commands_name_unique" ON "commands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "events_name_unique" ON "events"("name");

-- CreateIndex
CREATE UNIQUE INDEX "keywords_name_unique" ON "keywords"("name");

-- CreateIndex
CREATE INDEX "keywords_name_index" ON "keywords"("name");

-- CreateIndex
CREATE UNIQUE INDEX "settings_space_name_unique" ON "settings"("space", "name");

-- CreateIndex
CREATE UNIQUE INDEX "songs_likes_userid_name_unique" ON "songs_likes"("userId", "name");

-- CreateIndex
CREATE INDEX "users_username_index" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "variables_name_unique" ON "variables"("name");

-- CreateIndex
CREATE INDEX "variables_name_index" ON "variables"("name");

-- CreateIndex
CREATE UNIQUE INDEX "widgets_name_unique" ON "widgets"("name");

-- AddForeignKey
ALTER TABLE "commands" ADD FOREIGN KEY ("sound_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "greetings" ADD FOREIGN KEY ("sound_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_bits" ADD FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_daily_messages" ADD FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_tips" ADD FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
