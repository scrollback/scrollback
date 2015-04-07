var pg = require("../postgres.js"),
	assert = require("assert");

describe("select ", function () {
	console.log(pg.transformsToQuery([{
		type: "select",
		source: "texts",
		filters: [
			["tags", "cts", "sometag"],
			["to", "eq", "someroom"],
			{sql: 'NOT("tags" @> $$)', values: ['hidden']}
		],
		iterate: {}
	}]));
});
