/* jshint browser:true */

module.exports = function () {
	var arrayCacheOps = require('./arrayCacheOps.js');
	var objCacheOps = require('./objCacheOps.js');
	var config = require('../client-config.js');

    require('./textsCaching.js')(arrayCacheOps);
	require('./threadsCaching.js')(arrayCacheOps);
	require('./occupantCaching.js')(arrayCacheOps);

	require('./roomsCaching.js')(objCacheOps);
	require('./usersCaching.js')(objCacheOps);

	require('./sessionCaching.js')(objCacheOps);
	require('./quick-settings.js')(objCacheOps);

	// localStorage version check and upgrade.
	var version = 'version' + config.localStorage.version;
	if (!localStorage.hasOwnProperty(version)) {
		console.log("Old version of LocalStorage present, clearing ...");
		for (var k in localStorage) {
			if (k !== "session") { // session should not be cleared on LS update
				delete localStorage[k];
			}
		}
		localStorage[version] = true;
	} else {
		console.log("LocalStorage version is current ...");
	}

};