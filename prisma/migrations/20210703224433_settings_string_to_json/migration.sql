ALTER TABLE "settings" ALTER COLUMN "value" DROP DEFAULT;

ALTER TABLE "settings" ALTER COLUMN "value" TYPE JSON USING "value"::"json";

ALTER TABLE "settings" ALTER COLUMN "value" SET DEFAULT E'null';