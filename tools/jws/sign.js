// sign with default (HMAC SHA256)
var jwt = require('jsonwebtoken');
var fs = require("fs");

var payload = {
	"iss": "local.h10.in",
	"sub": "harish5@scrollback.io",
	"aud": "harry.scrollback.io",
	"iat": Math.floor((new Date()).getTime()/1000),
	"exp": Math.floor((new Date()).getTime()/1000) + 30000
};

var key = fs.readFileSync('../../test/server.key'); // 

var token = jwt.sign(payload, key, {
	algorithm: 'hs512',
	type: "jws"
});
console.log("TOKEN: ", token);
