BEGIN;

CREATE TYPE entType AS ENUM('room',
                            'user');

CREATE TYPE rolType AS ENUM('banned',
                            'gagged',
                            'none',
                            'visitor',
                            'follower',
                            'moderator',
                            'owner');

CREATE TYPE trnType AS ENUM('request',
                            'invite',
                            'timeout');

CREATE TABLE entities (
	id text PRIMARY KEY,
	type entType,
	description text,
	color integer,
	picture text,
	createTime timestamp,
	identities text[][],	/* identities[?][0] is gateway */
	timezone integer default 0,
	locale text,
	params jsonb,
	guides jsonb,
	terms tsvector,
	deleteTime timestamp
);

CREATE TABLE relations (
	"room" text REFERENCES entities,
	"user" text REFERENCES entities,
	role rolType,
	roleTime timestamp,
	
	officer text, /* moderator/inviter */
	message text,
	
	transitionRole rolType,
	transitionType trnType,
	transitionTime timestamp,
	
	lastVisitTime timestamp,
	PRIMARY KEY("room", "user")
);

/*****************************************************************************/

CREATE INDEX ON entities (type);
CREATE INDEX ON entities USING GIN (identities);
CREATE INDEX ON entities (timezone);
CREATE INDEX ON entities USING GIN (terms);
CREATE INDEX ON entities (id text_pattern_ops);

CREATE INDEX ON relations ("room");
CREATE INDEX ON relations ("user");
CREATE INDEX ON relations (role);
CREATE INDEX ON relations (transitionTime);
CREATE INDEX ON relations (lastVisitTime);

COMMIT;
