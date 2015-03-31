// sign with default (HMAC SHA256)
var jwt = require('jsonwebtoken');
var token = "token";
// sign with RSA SHA256

jwt.verify(token, 'certificate', function(err, decoded) {
  console.log(err, decoded); // bar
});
