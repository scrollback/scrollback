module.exports = function(core, config){
	require('./authRules/joinPartAuth.js')(core, config);
	require('./authRules/admitExpelAuth.js')(core, config);
	require('./authRules/awayBackAuth.js')(core, config);
	require('./authRules/textAuth.js')(core, config);
	require('./authRules/editAuth.js')(core, config);
	require('./authRules/roomAuth.js')(core, config);
	require('./authRules/userAuth.js')(core, config);
	require('./authRules/queryAuth.js')(core, config);
	require('./authRules/initAuth.js')(core, config);
};