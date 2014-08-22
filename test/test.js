var cd = __dirname;
cd = cd.substring(0, cd.length - 4);
require("blanket")({
	pattern: cd,
	"data-cover-never": "node_modules"
});
require("../irc/irc-test.js");
require("../authorizer/tests/authorizer-test.js");
require("../threader/threader-test.js");
require("../localStorage/ArrayCache-test.js");