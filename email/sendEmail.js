"use strict";
var nodemailer = require('nodemailer');
var log = require("../lib/logger.js");
var transport, emailConfig;

function send(from,to,subject,html) {

    var email = {
        from: from,
        to: to,
        subject: subject,
        html: html
    };
    if (emailConfig && emailConfig.bcc) {
        email.bcc = emailConfig.bcc;
    }

	transport.sendMail(email, function(error) {
        if(!error){
            log('Text message sent successfully!', email.to);
        }
        else{
            log("error in sending email: ",error, "retrying...");
            setTimeout(function(){
                send(email.from, email.to, email.subject, email.html);
            },300000);
        }
    });
}

module.exports = function(conf) {
	emailConfig = conf;
	transport = nodemailer.createTransport("SMTP", {
		host: "email-smtp.us-east-1.amazonaws.com",
		secureConnection: true,
		port: 465,
		auth: emailConfig && emailConfig.auth
	});
	return send;
};
