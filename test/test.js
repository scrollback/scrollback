"use strict";
var cd = __dirname;

cd = cd.substring(0, cd.length - 4);

require("blanket")({
	pattern: cd,
	"data-cover-never": function(str) {
		if (str.indexOf("node_modules") !== -1 || str.indexOf("client-config") !== -1 || str.indexOf("server-config") !== -1) {
			return true;
		}

		return (str.lastIndexOf("test") === str.length - 4);
	}
});

//require("../irc/irc-test.js");
require("../authorizer/tests/authorizer-test.js");
//require("../threader/threader-test.js");
require("../storage/storage-test.js");
require("../redis-storage/redis-test.js");
require("../lib/url-test.js");
require("../lib/validator-test.js");
require("../lib/obj-utils-test.js");
require("../lib/temp-map-test.js");
require("../lib/generate-test.js");
require("../validator/actionvalidator/actionvalidator-test.js");
require("../featured/featured-test.js");
require("../anti-abuse/anti-abuse-test.js");
