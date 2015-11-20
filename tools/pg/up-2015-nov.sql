alter table "entities"  add column "lastseentime" timestamp;
CREATE INDEX ON entities(lastseentime);