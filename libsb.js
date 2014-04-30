var core = Object.create(require("./lib/emitter.js"));
require('./interface/interface-client')(core);
require('./localStorage/localStorage-client')(core);
require('./socket/socket-client')(core);
//# sourceMappingURL=libsb.js.map