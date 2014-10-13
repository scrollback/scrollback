module.exports = function(core){
	require('./authRules/joinPartAuth.js')(core);
	require('./authRules/admitExpelAuth.js')(core);
	require('./authRules/awayBackAuth.js')(core);
	require('./authRules/textAuth.js')(core);
	require('./authRules/editAuth.js')(core);
	require('./authRules/roomAuth.js')(core);
	require('./authRules/userAuth.js')(core);
	require('./authRules/queryAuth.js')(core);
//	require('./authRules/initAuth.js')(core);
};