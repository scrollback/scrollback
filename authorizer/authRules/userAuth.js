var SbError = require('../../lib/SbError.js');
var utils = require('../../lib/app-utils.js');
function emailValidation(old, user) {
	var oldEmail, newEmail;
	for (var i = 0; i < old.length; i++) {
		if (/mailto:/.test(old[i])) {
			oldEmail = old[i];
			break;
		}
	}
	for (i = 0; i < user.length; i++) {
		if (/mailto:/.test(user[i])) {
			newEmail = user[i];
		}
	}
	if (oldEmail && oldEmail !== newEmail) {
		return true;
	}
	return false;
}
module.exports = function (core) {

	core.on('user', function (action, callback) {
		if (action.role === 'su' || utils.isInternalSession(action.session)) {
			delete action.user.role;
			return callback();
		} else if (action.user.role === "none") {
			if (/^guest-/.test(action.user.id)) {
				action.user.role = "guest";
			} else {
				action.user.role = "registered";
			}
		}
		if (action.user.role === "guest") return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'user',
			requiredRole: 'registered',
			currentRole: action.user.role
		}));
		if (!action.old || !action.old.id) return callback();
		else if (!action.old.identities) {
			return callback();
		} else if (emailValidation(action.old.identities, action.user.identities)) {
			return callback(new SbError('ERR_NOT_ALLOWED', {
				source: 'authorizer',
				action: 'user',
				requiredRole: 'registered',
				currentRole: action.user.role
			}));
		} else if (action.from === action.old.id) return callback();
		else return callback(new SbError('ERR_NOT_ALLOWED', {
			source: 'authorizer',
			action: 'user',
			requiredRole: 'registered',
			currentRole: action.user.role
		}));

	}, "authorization");
};
