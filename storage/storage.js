var queryTr = require('./query-transform.js'),
	actionTr = require('./action-transform.js'),
	resultTr = require('./result-transform.js'),
	conf = require('../config.js').storage,
	pg = require('./postgres.js')(conf.db);

function getHandler(type) {
	return function(query, next) {
		pg.get(queryTr[type](query), function(err, results) {
			if(err) return next(err);
			query.results = resultTr[type](results);
			next();
		});
	};
}

function putHandler(type) {
	return function(object, next) {
		pg.put(actionTr[type](object), function(err) {
			if(err) next(err);
			next();
		});
	};
}

module.exports = function(core) {
	var s = "storage";
    
	["text", "edit", "room", "user", "join", "part", "admit", "expel"].forEach(function(action) {
		core.on(action, putHandler(action));
	});
	
	["getTexts", "getThreads", "getRooms", "getUsers", "getEntities"].forEach(function(query) {
		core.on(query, getHandler(query));
	});
	
};
