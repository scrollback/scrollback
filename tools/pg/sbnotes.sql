CREATE TYPE actType AS ENUM('room', 'user',
						    'text', 'edit',
						    'back', 'away',
						    'admit', 'expel');

CREATE TABLE notes (
	"user" text,
	"action" actType,
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
