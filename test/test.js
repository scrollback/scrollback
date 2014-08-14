var cd = __dirname;
cd = cd.substring(0, cd.length - 4);
require("blanket")({pattern: cd});
require("../irc/irc-test.js");
require("../authorizer/tests/authorizer-test.js");
