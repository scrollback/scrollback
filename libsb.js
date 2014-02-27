var core = new (require('./lib/client-emitter.js'))();
require('./interface/interface-client')(core);
require('./localstorage/localstorage-client')(core);
require('./socket/socket-client')(core);
//# sourceMappingURL=libsb.js.map
