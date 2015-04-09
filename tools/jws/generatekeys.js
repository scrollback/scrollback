var secureRandom = require("secure-random");
var key = secureRandom(128, {type:"Buffer"}).toString("hex");
console.log(key);