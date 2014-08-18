/* jslint browser: true */

var core = new (require("./lib/emitter.js"))();
window.validate = require('./lib/validate.js');
window.generate = require('./lib/generate');

// libsb files
require('./interface/interface-client')(core);
require('./localStorage/localStorage-client')(core);
require('./socket/socket-client')(core);
require('./id-generator/id-generator-client.js');
