var nodemailer = require('nodemailer');
var transport;
var Email = function(config) {
	this.config = config;
	transport = nodemailer.createTransport("SMTP", {
		host: "email-smtp.us-east-1.amazonaws.com",
		secureConnection: true,
		port: 465,
		auth: config
	});
};

Email.prototype.send = function(from, to, subject, html, callback) {
	var email = {
		from: from,
		to: to,
		subject: subject,
		html: html
	};
	if (!callback) callback = function() {};
	transport.sendMail(email, callback);
};

module.exports = Email;
