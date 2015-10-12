ALTER TABLE "notes"
	DROP COLUMN "user",
	DROP COLUMN "score",
	DROP COLUMN "readTime",
	DROP COLUMN "dismissTime",
	ADD COLUMN "notify" jsonb;

CREATE INDEX CONCURRENTLY ON "notes" USING GIN ("notify", "notetype", "group");
