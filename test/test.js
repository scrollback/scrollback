var cd = __dirname;
cd = cd.substring(0, cd.length - 4);
require("blanket")({
	pattern: cd,
	"data-cover-never": function(str) {
		if (str.indexOf("node_modules") !== -1 || str.indexOf("myConfig") !== -1) {
			return true;
		}
		if (str.lastIndexOf("test") === str.length - 4) return true;
		return false;
	}
});
require("../irc/irc-test.js");
require("../authorizer/tests/authorizer-test.js");
require("../localStorage/ArrayCache-test.js");
require("../lib/redisProxy-test.js");
require("../localStorage/userCache-test.js");
require("../threader/threader-test.js");
require("../lib/emitter-test.js");
require("../leveldb-storage/leveldb-test.js");
require("../redis-storage/redis-test.js");
require("../lib/validate-test.js");
require("../validator/validator-test.js");
require("../recommendation/recommendation-test.js");
