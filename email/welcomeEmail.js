var config = require('../config.js');
var log = require("../lib/logger.js");
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
		core.on('user',emailRoomListener , "gateway"); 
	}
	else {
		log("email module is not enabled");
	}

};

function emailRoomListener(action, callback){
    log("user welcome email ", action);
    if(!action.old.id) {//Signup
        sendWelcomeEmail(action.user);
    }
	callback();
}

function init() {
    //read welcome email jade
    fs.readFile(__dirname + "/views/welcomeEmail.jade", "utf8", function(err, data) {
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
		if (u.indexOf('mailto:') === 0) {
			emailAdd = u.substring(7);
		}
	});
	log("email add", user, emailAdd);
	if (emailAdd) {
		log("sending welcome email." , emailAdd);
		send(emailConfig.from, emailAdd, "Welcome to Scrollback", emailHtml);
	}
}