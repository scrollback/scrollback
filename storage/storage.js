var queryTr = require('./query-transform.js'),
	actionTr = require('./action-transform.js'),
	resultTr = require('./result-transform.js'),
	log = require('../lib/logger.js'),
	config, ps;
	
function getHandler(type) {
	return function(query, next) {
		if (!query.results) {
			ps.get(queryTr[type](query), function(err, results) {
				if(err) return next(err);
				query.results = resultTr[type](query, results); // reply of run queries is passed here.
				next();
			});
		} else next();
	};
}

function putHandler(type) {
	return function(object, next) {
		log.d("put: ", object);
		ps.put(actionTr[type](object), function(err) {
			if(err) next(err);
			else next();
		});
	};
}

module.exports = function(core, conf) {
	//var s = "storage";
	config = conf;
	ps = require('./postgres-storage.js')(config);
	require('./timestamp.js')(core, config);
	["text", "edit", "room", "user", "join", "part", "admit", "expel"].forEach(function(action) {
		core.on(action, putHandler(action), "storage");
	});
	
	["getTexts", "getThreads", "getRooms", "getUsers", "getEntities"].forEach(function(query) {
		core.on(query, getHandler(query), "storage");
	});
};
