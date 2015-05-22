// S3 policy generator test

var core = require("ebus")();

require("./s3polgen.js")(core);

it("should generate policies", function () {
	core.emit("http/getPolicy", {
		user: "sindhus",
		uploadType: "avatar"
	}, function (err, payload) {
		console.log(payload);
	});
});

