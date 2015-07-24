var secureRandom = require("secure-random");
var key = secureRandom(128, {type:"Buffer"}).toString("base64");
console.log(key);