/*
--------------------------------------
SbError: Enhanced Error Objects
--------------------------------------
USAGE:
---------

try {
	
	throw new SbError('ERR_NOT_ALLOWED', {
		source: 'authorizer', 
		id: generate.uid(), 
		
		// Error Specific fields below
		
		source: 'authorizer', 
		action: 'edit',
		requiredRole: 'moderator',
		currentRole: 'guest'
	});
	
} catch (e) {
	console.log("Caught error ", e);
}

-------------------------------------
*/

var generate = require('./generate.js');

var SbError = function (type, error) {
	this.type = 'error';
	this.message = type;
	this.source = error.source;
	this.action = error.action;
	this.requiredRole = error.requiredRole;
	this.currentRole = error.currentRole;
	this.id = error.id || generate.uid();
};

SbError.prototype = new Error();
SbError.prototype.constructor = SbError;

module.exports = SbError;