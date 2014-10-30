CREATE TABLE threads (
	id text,
	"from" text,
	"to" text,
	title text,
	startTime timestamp,
	endTime timestamp,
	length integer,
	tags text[],
	concerns text[],
	terms tsvector,
	updateTime timestamp,
	updater text
);

CREATE TABLE texts (
	id text,
	"from" text,
	"to" text,
	"time" timestamp,
	"text" text,
	position integer,
	thread text,
	tags text[],
	mentions text[],
	upvoters text[],
	flaggers text[],
	updateTime timestamp,
	updater text
);

/*

	Down the line, this will be the schema of the text object that’s
	returned by getTexts.

	The text action will have a slightly different schema: It will not
	have upvoters, flaggers, updateTime and updater fields, but will
	have title (if this text changes the thread title), concerns (an
	associative array of people and a score of how much this message
	concerns them)

*/