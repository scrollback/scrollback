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
	id text,
	type entType,
	description text,
	picture text,
	createTime timestamp,
	identities text[][],	/* identities[?][0] is gateway */
	timezone integer,
	locale text,
	params jsonb,
	deleteTime timestamp
);

CREATE TABLE rooms (
	guides jsonb
) INHERITS (entities);

CREATE TABLE users (
) INHERITS (entities);

CREATE TABLE memberships (
	"room" text,
	"user" text,
	role rolType,
	roleTime timestamp,
	
	officer text, /* admitter/expeller */
	reason text,  /*  */
	
	transitionRole rolType,
	transitionType trnType,
	transitionTime timestamp,
	
	lastVisitTime timestamp
);

