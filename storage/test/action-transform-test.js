var at = require("../action-transform.js"),
	assert = require("assert");


// TODO: make test pass
describe("text tests", function () {
	it("should insert texts", function () {
		assert.deepEqual(console.log(at.text({
			id: "1234567890abcdef",
			tags: ["hidden", "thread-hidden"],
			text: "hey",
			from: "somebody",
			to: "someroom",
			thread: "1234567890abcdef",
			time: 1428090236975
		})[1]), [{
			"source":"texts","filters":[],"type":"insert",
			"insert":{
				"id":"1234567890abcdef","from":"somebody","to":"someroom","text":"hey",
				"time":"2015-04-03T19:43:56.975Z","updatetime":"2015-04-03T19:43:56.975Z",
				"thread":"1234567890abcdef","tags":["hidden","thread-hidden"]
			}
		},{
			"source":"threads","filters":[["id","eq","1234567890abcdef"]],"type":"upsert",
			"update":[
				["updatetime","set","2015-04-03T19:43:56.975Z"],["updater","set","somebody"],["length","incr",1]
			],
			"lock":"1234567890abcdef","insert":{
				"id":"1234567890abcdef","from":"somebody","to":"someroom","title":"hey",
				"starttime":"2015-04-03T19:43:56.975Z","length":1,"tags":["thread-hidden"],
				"updatetime":"2015-04-03T19:43:56.975Z","updater":"somebody"
			}
		}]);
	});
});
