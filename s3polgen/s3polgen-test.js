// S3 policy generator test
// Run with `mocha s3polgen-test.js`

var Ebus = require("ebus");
	core = new Ebus();

require("./s3polgen.js")(core);

it("should generate policies", function () {
	// This is sample action (ie, request)
	core.emit("http/getPolicy", {
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

