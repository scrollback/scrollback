var qt = require("../query-transform.js"),
	assert = require("assert");

describe("getTexts", function () {
	it("Should create a valid transform", function () {
		console.log(qt.getTexts({
			user: { role: "owner" },
			to: "someroom",
			time: 1498348593845,
			before: 25
		})[0].filters);
	});
});