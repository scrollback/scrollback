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
	var i;
	Error.call(this, type);
	for(i in data) {
		if(data.hasOwnProperty(i)) {
			this[i] = data[i];
		}
	}
};

SbError.prototype = new Error();

module.exports = SbError;