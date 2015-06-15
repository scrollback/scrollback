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
	assert.deepEqual(query, { '$': 'SELECT "action", "notetype", "group", MAX("score") as "score", MAX("time") AS "time", COUNT(*) AS "count", CASE WHEN MAX(COALESCE(readtime, \'2050-01-01\')) = \'2050-01-01\'THEN NULL ELSE MAX(readtime) END AS readtime FROM notes WHERE "user"=${user} AND dismissTime IS NULL GROUP BY "action", "notetype", "group"',
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
