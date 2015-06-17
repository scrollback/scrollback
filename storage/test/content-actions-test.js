/*eslint-env mocha*/
/*eslint no-console: 0*/
/*eslint no-undefined: 0*/
'use strict';
var content = require("../actions/content.js"),
	util = require("util"),
	assert = require("assert");

it("insert query for text action", function() {
	var query = content({
		type: "text",
		id: "sasw4efsdewrewrrcdswerewqwe3432",
		from: "testinguser",
		to: "scrollback",
		time: 1433852225717,
		text: "testing message",
		thread: "32332hhhkhh23h3h2g432hg42"
	});
	console.log(util.inspect(query, {
		depth: 4
	}));
	assert.deepEqual(query, [ { '$': 'INSERT INTO "texts" ( "id", "from", "to", "time", "text", "thread", "title", "tags", "mentions", "upvoters", "flaggers", "updatetime", "updater" ) VALUES ( ${id}, ${from}, ${to}, ${time}, ${text}, ${thread}, ${title}, ${tags}, ${mentions}, ${upvoters}, ${flaggers}, ${updatetime}, ${updater} )',
    id: 'sasw4efsdewrewrrcdswerewqwe3432',
    from: 'testinguser',
    to: 'scrollback',
    time: new Date(1433852225717),
    text: 'testing message',
    thread: '32332hhhkhh23h3h2g432hg42',
    title: undefined,
    tags: [],
    mentions: undefined,
    upvoters: [],
    flaggers: [],
    updatetime: new Date(1433852225717),
    updater: 'testinguser' },
  { '$': 'UPDATE threads SET updatetime=${updatetime}, updater=${updater}, length=length+1 WHERE id=${id}',
    updatetime: new Date(1433852225717),
    updater: 'testinguser',
    id: '32332hhhkhh23h3h2g432hg42' } ], "wrong query for text action");
});

it("query for edit action(text)", function() {
	var query = content({
		type: "edit",
		from: "testinguser",
		to: "scrollback",
		time: 1433852225717,
		text: "edit testing message",
		thread: "32332hhhkhh23h3h2g432hg42"
	});
	console.log(util.inspect(query, {
		depth: 4
	}));
	assert.deepEqual(query, [ { '$': 'UPDATE "texts" SET  "updatetime"=${updatetime}, "text"=${text} WHERE id=${id}',
    updatetime: new Date(1433852225717),
    text: 'edit testing message',
    id: undefined } ], "wrong Query for editing a text");
});

it("query for edit action(tags)", function() {
	var query = content({
		type: "edit",
		from: "testinguser",
		to: "scrollback",
		time: 1433852225717,
		tags: ["hidden"],
		thread: "32332hhhkhh23h3h2g432hg42"
	});
	console.log(util.inspect(query, {
		depth: 4
	}));
	assert.deepEqual(query, [ { '$': 'UPDATE "texts" SET  "updatetime"=${updatetime}, "tags"=${tags} WHERE id=${id}',
    updatetime: new Date(1433852225717),
    tags: [ 'hidden' ],
    id: undefined },
  { '$': 'UPDATE "threads" SET  "updatetime"=${updatetime}, "tags"=${tags} WHERE id=${id}',
    updatetime: new Date(1433852225717),
    tags: [ 'hidden' ],
    id: undefined } ], "wrong Query for editing tag");
});

it("query for edit action(title with tags)", function() {
	var query = content({
		type: "edit",
		from: "testinguser",
		to: "scrollback",
		time: 1433852225717,
		thread: "32332hhhkhh23h3h2g432hg42",
		tags: ["abbusive"],
		title: "editing the tittle",
		ref: "324hhg382t43g4372g4u324"
	});
	console.log(util.inspect(query, {
		depth: 4
	}));
	assert.deepEqual(query, [ { '$': 'UPDATE "texts" SET  "updatetime"=${updatetime}, "tags"=${tags} WHERE id=${id}',
    updatetime: new Date(1433852225717),
    tags: [ 'abbusive' ],
    id: '324hhg382t43g4372g4u324' },
  { '$': 'UPDATE "threads" SET  "updatetime"=${updatetime}, "title"=${title}, "tags"=${tags} WHERE id=${id}',
    updatetime: new Date(1433852225717),
    title: 'editing the tittle',
    tags: [ 'abbusive' ],
    id: '324hhg382t43g4372g4u324' } ], "wrong Query for editing a title");
});

it("query for edit action(title)", function() {
	var query = content({
		type: "edit",
		from: "testinguser",
		to: "scrollback",
		time: 1433852225717,
		thread: "32332hhhkhh23h3h2g432hg42",
		title: "editing the tittle",
		ref: "324hhg382t43g4372g4u324"
	});
	console.log(util.inspect(query, {
		depth: 4
	}));
	assert.deepEqual(query, [ { '$': 'UPDATE "threads" SET  "updatetime"=${updatetime}, "title"=${title} WHERE id=${id}',
    updatetime: new Date(1433852225717),
    title: 'editing the tittle',
    id: '324hhg382t43g4372g4u324' } ], "wrong Query for editing a title");
});
