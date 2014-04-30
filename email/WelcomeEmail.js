var config = require('../config.js');
var log = require("../lib/logger.js").tag("mail");
var fs=require("fs"),jade = require("jade");
var emailConfig = config.email;
var welcomeEmailJade;
var core;
var send = require('./sendEmail.js');

/**
 * It is used to Send Email
 * Listen to Room Event
 * @param coreObject
 */
module.exports = function(coreObject) {
	core = coreObject;
	if (config.email && config.email.auth) {
		init();
		core.on('user',emailRoomListner ,"gateway");function(user, callback );
	}
	else {
		log("email module is not enabled");
	}

};

function emailRoomListner(action, callback){
    callback();
     if(action.old === null) {//Signup
        sendWelcomeEmail(user);
     }
}

function init() {
    //read welcome email jade
    fs.readFile("../templates/welcomeEmail.jade", "utf8", function(err, data) {
        if(err) throw err;
        welcomeEmailJade = jade.compile(data,  {basedir: __dirname + "/views/"});
        log("welcome emails " , welcomeEmailJade );
    });
}


/**
 *send welcome mail to user
 *@param {Object} user
 */
function sendWelcomeEmail(user) {
    var emailHtml = welcomeEmailJade(user);
    var emailAdd = false;
    user.identities.forEach(function (u) {
        if (u.id.indexOf('mailto:') === 0) {
            emailAdd = u.id.substring(7);
        }
    });
    if (emailAdd) {
        log("sending welcome email." , emailAdd);
        send(emailConfig.from, emailAdd, "Welcome", emailHtml);
    }
}