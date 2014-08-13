var utils = function(){};

utils.prototype.makeAction = function (action, role, userRole, victimRole) {
	return {
		id: 'asfsaf',
		type: action,
		to: 'testroom',
		user: {
			role: userRole
		},
		victim: {
			role: victimRole
		},
		room: {
			guides: {
				authorizer: {
					openFollow: true
				}
			}
		},
		role: role
	};
};

module.exports = utils;