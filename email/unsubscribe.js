var jwt = require("jsonwebtoken"),
	log = require("../lib/logger");

module.exports = function (core, config)

 {
	/*
		1. Receive the request
		2. Extract the email address from the request.
		3. Search the database and find that user.
		4. Change their settings so that their email notifications is "Never" and save to database.
		5. Show a message to the user saying they have been unsubscribed.
	*/

	// When the server is starting up...
	core.on("http/init", function (payload) {

		payload.push({
			get: {
				"/r/unsubscribe": handleRequest
			}
		});
	});

	function handleRequest (req, res) {
		var decoded, emailAddress;
		console.log(req.query)
		// extract the Email address from the request
		try {
			decoded = jwt.verify(req.query.email, config.secret);

		} catch (e) {
			log.i("Invalid unsubscribe JWT: " + req.query.email);
			res.end("You were not unsubscribed because the unsubscribe link has expired. Please click the link on a newer email.");
		}
		emailAddress = decoded.email;

		// search the database and find the user with this email
		core.emit("getUsers", {
			identity: "mailto:" + emailAddress,
			session: "internal/unsubscribe"
		}, function (err, query) {
			if (err) {
				res.end("Sorry, an internal server error prevented you from being unsubscribed.");
				return;
			}

			if(!query.results || !query.results.length) {
				return res.end("User doesn't exist.");
			}
			
			// Received the user from the database! Changing the settings...
			var user = query.results[0];
			
			user.params.email=user.params.email || {};

			user.params.email.frequency = "never";
			user.params.email.notifications = false;
			

			// Saving the saved settings back into the database.
			core.emit("user", {
				to: user.id,
				user: user,
				session: "internal/unsubscribe"
			}, function (err) {
				if (err) {
					res.end("Sorry, an internal server error prevented you from being unsubscribed.");
					return;
				}
				res.end("You have been unsubscribed.");
			});
		});
	};
  
};




/*
	email = ...
	expiry_date = ...
	sign = hash(email + "." + secretCode)

	secretCode = "mr. asarmatta's password this is very secret do not leak."
	

*/