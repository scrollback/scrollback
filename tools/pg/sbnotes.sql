CREATE TABLE notes (
	"user" text,
	ref text,
	notetype text,
	"group" text,
	score integer,
	"time" timestamp,
	notedata jsonb,
	readTime timestamp,
	dismissTime timestamp
);

CREATE INDEX ON notes ("user", "action", "group", "notetype");
CREATE INDEX ON notes ("user", "action", "group", "notetype", "ref");
