var ebus = require("ebus");
var core = new ebus();

//require("./range-ops-test.js");
var store = require("./../store.js")(core, {});
require("./state-manager-test.js")(core, {}, store);


