// S3 policy generator test
// Run with `mocha s3polgen-test.js`

/* eslint-env mocha */

"use strict";

var Ebus = require("ebus"),
	core = new Ebus(),
	config = require("../server-config-defaults");

require("./upload.js")(core, config.upload);

it("should generate policies", function () {
	// This is sample action (ie, request)
	core.emit("upload/getPolicy", {
		user: {
				id: "sindhus"
			},
		uploadType: "avatar",
		textId: "" // only if uploadType is content
	}, function (err, payload) {
		if(err) console.log("Error happened", err.message, err.stack);
		console.log("Result payload:", payload);
	});
});

