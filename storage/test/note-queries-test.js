/*eslint-env mocha*/
"use strict"

var note = require("../queries/note")[0],
	note1 = require("../queries/note")[1],
	assert = require("assert");

it("note query test", function(){
	var query = note({
		user: {
			id: "userid1"
		}
	});
	
	console.log(query);
	assert.deepEqual(query, { '$': 'SELECT "ref", "notetype", "user", "score", "notedata", "group", "time", "count" FROM (SELECT *,COUNT(*) OVER (PARTITION BY "user", "notetype", "group" ) "count",RANK() OVER (PARTITION BY "user", "notetype", "group" ORDER BY "time" DESC) timeRank FROM notes WHERE "user" = ${user} AND dismisstime IS NULL) t WHERE "count" <= 3 OR timeRank = 1;',
  user: 'userid1' }, "wrong query");
});

//it.only("note query test(with rows)", function(){
//	var query = note1({
//		user: {
//			id: "userid1"
//		}
//	}, [{'action': "text", 'noteType': "mention", 'group': "room1", 'score':3, 'time': 1434019521590},
//	   {'action': "admit", 'noteType': "invite", 'group': "room1", 'score':3, 'time': 1434019521590}]);
//	
//	console.log(query);
//});
