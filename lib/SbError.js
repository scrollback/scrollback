/*
--------------------------------------
SbError Structure:
--------------------------------------

{
	message: 'ERR_NOT_ALLOWED',
	info: { 					//  error publisher related information.
		origin: "Authorizer",
		action: 'text',
		requiredRole: 'follower',
		currentRole: 'guest'
	}
}

-------------------------------------
*/

var generate = require('./generate.js');

var SbError = function(error){
	this.message = error.message;
	this.info = error.info;
	this.type = 'sberror';
	this.id = generate.uid();
};

SbError.prototype = new Error();
SbError.prototype.constructor = SbError;

module.exports = SbError;