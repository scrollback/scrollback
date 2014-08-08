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

var SbError = function (type, error) {
	var i;
	if (error) {
		error.message = type;
	} else {
		error = {
			message: type
		}
	}
	Error.call(this, type);
	for (i in error) {
		if (error.hasOwnProperty(i)) {
			this[i] = error[i];
		}
	}
};

SbError.prototype = new Error();

module.exports = SbError;