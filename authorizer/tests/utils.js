var utils = function(){};

utils.prototype.makeAction = function (action, role, userRole) {
	return {
		id: 'asfsaf',
		type: action,
		to: 'testroom',
		user: {
			role: userRole
		},
		victim: {
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