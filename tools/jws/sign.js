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

var cert = fs.readFileSync('../../test/server.key'); // get private key

var token = jwt.sign(payload, cert, {
	algorithm: 'RS256',
	type: "jws"
});
console.log("TOKEN: ", token);
