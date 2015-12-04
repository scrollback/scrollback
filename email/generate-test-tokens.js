var secret = require("../server-config.js").unsubscribe.secret,
	jwt = require("jsonwebtoken"),
	email = process.argv[2];


console.log(secret)
console.log(email);
console.log(jwt.sign({ email: email }, secret, {expiresIn: "5 days"}));


// https://$domain/r/unsubscribe?jwt=$token
