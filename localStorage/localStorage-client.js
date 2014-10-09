module.exports = function () {
	var arrayCacheOps = require('./arrayCacheOps.js');
	var objCacheOps = require('./objCacheOps.js');

	require('./textsCaching.js')(arrayCacheOps);
	require('./threadsCaching.js')(arrayCacheOps);
	require('./occupantCaching.js')(arrayCacheOps);

	require('./roomsCaching.js')(objCacheOps);
	require('./usersCaching.js')(objCacheOps);

	require('./sessionCaching.js')(objCacheOps);
};