BEGIN;

CREATE TABLE threads (
	id text PRIMARY KEY,
	"from" text,
	"to" text,
	title text,
	color integer,
	starttime timestamp,
	length integer,
	tags text[],
	concerns text[],
	terms tsvector,
	updatetime timestamp,
	updater text
);

CREATE TABLE texts (
	id text PRIMARY KEY,
	"from" text,
	"to" text,
	"time" timestamp,
	"text" text,
	thread text,
	title text,
	tags text[],
	mentions text[],
	upvoters text[],
	flaggers text[],
	updatetime timestamp,
	updater text
);

/*****************************************************************************/

CREATE INDEX ON texts ("to", "time");
CREATE INDEX ON texts ("to", "updatetime");
CREATE INDEX ON texts ("to", "thread", "time");
CREATE INDEX ON texts ("to", "thread", "updatetime");
CREATE INDEX ON texts ("mentions", "time");
CREATE INDEX ON texts ("mentions", "updatetime");
CREATE INDEX ON texts USING GIN (tags);

CREATE INDEX ON threads ("to", "starttime");
CREATE INDEX ON threads ("to", "updatetime");
CREATE INDEX ON threads ("concerns", "starttime");
CREATE INDEX ON threads ("concerns", "updatetime");
CREATE INDEX ON threads USING GIN (tags);
CREATE INDEX ON threads USING GIN (terms);

COMMIT;