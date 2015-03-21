var ebus = require("ebus");
var core = new ebus();


var store = require("./../store.js")(core, {});
require("./state-manager-test.js")(core, {}, store);
require("./range-ops-test.js")(core, {}, store);



