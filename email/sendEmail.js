var nodemailer = require('nodemailer');
var log = require("../lib/logger.js").tag("mail");
var config = require('../config.js');
var emailConfig = config.email;
var transport = nodemailer.createTransport("SMTP", {
    host: "email-smtp.us-east-1.amazonaws.com",
    secureConnection: true,
    port: 465,
    auth: emailConfig && emailConfig.auth
});
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

    if (emailConfig.debug) {
        log("sending email :", email);
    }
    transport.sendMail(email, function(error) {
        if(!error){
            log('Text message sent successfully!');
        }
        else{
            log("error in sending email: ",error, "retrying...");
            setTimeout(function(){
                send(email.from, email.to, email.subject, email.html);
            },300000);
        }
    });
}

module.exports = send;
