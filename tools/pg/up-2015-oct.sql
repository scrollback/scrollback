ALTER TABLE "notes"
	DROP COLUMN "user",
	DROP COLUMN "score",
	DROP COLUMN "readTime",
	DROP COLUMN "dismissTime",
	ADD COLUMN "notify" jsonb;

CREATE INDEX CONCURRENTLY ON "notes" USING GIN ("notify", "notetype", "group");

--
-- install postgis and create extension
--


ALTER TABLE entities ADD COLUMN location geography;

-- update entities set location

CREATE INDEX ON entities USING GIST (location);
VACUUM ANALYZE entities(location);